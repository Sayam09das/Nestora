import type { Prisma, PrismaClient } from '@nestora/database';
import type { DailyRegisterDeskQuery } from '@nestora/validators';

export type DailyRegisterCategory =
  | 'Attendance'
  | 'Movement'
  | 'Visitor'
  | 'Leave'
  | 'Complaint'
  | 'Incident';

export type DailyRegisterEntry = {
  id: string;
  occurredAt: string;
  category: DailyRegisterCategory;
  headline: string;
  detail: string;
  resident?: string;
  location?: string;
  linkPath?: string;
};

export type DailyRegisterDeskSummary = {
  generatedAt: string;
  registerDate: string;
  totalEntries: number;
  attendance: {
    present: number;
    absent: number;
    onLeave: number;
    ratePct: number | null;
  };
  counts: Record<DailyRegisterCategory, number>;
  facets: { categories: DailyRegisterCategory[] };
};

function parseRegisterDate(input?: string): { date: string; start: Date; end: Date } {
  const now = new Date();
  const iso =
    input?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(input)
      ? input.trim()
      : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  const parts = iso.split('-').map((p) => Number(p));
  const start = new Date(Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { date: iso, start, end };
}

async function resolveHostelIds(
  prisma: PrismaClient,
  hostelName?: string,
  scopeHostelNames?: string[],
): Promise<string[] | null> {
  if (hostelName?.trim() && hostelName !== 'All Hostels') {
    const row = await prisma.hostel.findFirst({
      where: { name: { equals: hostelName.trim(), mode: 'insensitive' }, isActive: true },
      select: { id: true },
    });
    return row ? [row.id] : [];
  }
  if (scopeHostelNames?.length) {
    const rows = await prisma.hostel.findMany({
      where: {
        isActive: true,
        name: scopeHostelNames.length === 1
          ? { equals: scopeHostelNames[0], mode: 'insensitive' }
          : { in: scopeHostelNames, mode: 'insensitive' },
      },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
  return null;
}

function hostelWhere(hostelIds: string[] | null): { hostelId?: { in: string[] } } {
  if (!hostelIds?.length) return {};
  return { hostelId: { in: hostelIds } };
}

function studentDisplayName(
  student: { user: { firstName: string; lastName: string }; registrationNumber: string } | null,
): string {
  if (!student) return 'Resident';
  const name = `${student.user.firstName} ${student.user.lastName}`.trim();
  return name || student.registrationNumber;
}

function matchesQuery(entry: DailyRegisterEntry, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    entry.headline.toLowerCase().includes(needle) ||
    entry.detail.toLowerCase().includes(needle) ||
    (entry.resident?.toLowerCase().includes(needle) ?? false) ||
    (entry.location?.toLowerCase().includes(needle) ?? false)
  );
}

function matchesCategory(entry: DailyRegisterEntry, category?: string): boolean {
  if (!category?.trim() || category === 'All Categories') return true;
  return entry.category === category;
}

function pushAndSort(entries: DailyRegisterEntry[]): DailyRegisterEntry[] {
  return entries.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 400);
}

export async function getDailyRegisterDeskSummary(
  prisma: PrismaClient,
  query: DailyRegisterDeskQuery,
  scopeHostelNames?: string[],
): Promise<DailyRegisterDeskSummary> {
  const { date, start, end } = parseRegisterDate(query.date);
  const hostelIds = await resolveHostelIds(prisma, query.hostel, scopeHostelNames);
  const hw = hostelWhere(hostelIds);

  const attendanceDay = new Date(`${date}T00:00:00.000Z`);
  const attendanceGroups = await prisma.attendanceRecord.groupBy({
    by: ['status'],
    where: {
      attendanceDate: attendanceDay,
      ...hw,
    },
    _count: { _all: true },
  });
  let present = 0;
  let absent = 0;
  let onLeave = 0;
  for (const row of attendanceGroups) {
    const n = row._count._all;
    if (row.status === 'PRESENT') present += n;
    else if (row.status === 'ABSENT') absent += n;
    else if (row.status === 'ON_LEAVE') onLeave += n;
  }
  const marked = present + absent + onLeave;
  const ratePct = marked > 0 ? Math.round((present / marked) * 1000) / 10 : null;

  const entries = await buildRegisterEntries(prisma, { start, end, hw, attendanceDay });
  const counts: Record<DailyRegisterCategory, number> = {
    Attendance: 0,
    Movement: 0,
    Visitor: 0,
    Leave: 0,
    Complaint: 0,
    Incident: 0,
  };
  for (const e of entries) counts[e.category] += 1;

  return {
    generatedAt: new Date().toISOString(),
    registerDate: date,
    totalEntries: entries.length,
    attendance: { present, absent, onLeave, ratePct },
    counts,
    facets: {
      categories: ['Attendance', 'Movement', 'Visitor', 'Leave', 'Complaint', 'Incident'],
    },
  };
}

export async function listDailyRegisterDeskEntries(
  prisma: PrismaClient,
  query: DailyRegisterDeskQuery,
  scopeHostelNames?: string[],
): Promise<DailyRegisterEntry[]> {
  const { start, end } = parseRegisterDate(query.date);
  const hostelIds = await resolveHostelIds(prisma, query.hostel, scopeHostelNames);
  const hw = hostelWhere(hostelIds);
  const attendanceDay = new Date(`${parseRegisterDate(query.date).date}T00:00:00.000Z`);

  let entries = await buildRegisterEntries(prisma, { start, end, hw, attendanceDay });
  entries = entries.filter((e) => matchesCategory(e, query.category) && matchesQuery(e, query.q ?? ''));
  return entries;
}

type BuildCtx = {
  start: Date;
  end: Date;
  hw: { hostelId?: { in: string[] } };
  attendanceDay: Date;
};

async function buildRegisterEntries(prisma: PrismaClient, ctx: BuildCtx): Promise<DailyRegisterEntry[]> {
  const { start, end, hw, attendanceDay } = ctx;
  const inDay: Prisma.DateTimeFilter = { gte: start, lt: end };
  const entries: DailyRegisterEntry[] = [];

  const [
    corrections,
    discrepancies,
    visitors,
    movements,
    leaves,
    outings,
    complaints,
    incidents,
  ] = await Promise.all([
    prisma.attendanceCorrectionLog.findMany({
      where: {
        correctedAt: inDay,
        attendance: { attendanceDate: attendanceDay, ...hw },
      },
      take: 80,
      orderBy: { correctedAt: 'desc' },
      include: {
        attendance: {
          include: {
            student: { include: { user: { select: { firstName: true, lastName: true } } } },
            hostel: { select: { name: true } },
          },
        },
      },
    }),
    prisma.attendanceDiscrepancy.findMany({
      where: {
        createdAt: inDay,
        attendance: { ...hw },
      },
      take: 40,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        attendance: { include: { hostel: { select: { name: true } } } },
      },
    }),
    prisma.visitorRecord.findMany({
      where: {
        ...hw,
        OR: [{ createdAt: inDay }, { checkInTime: inDay }, { checkOutTime: inDay }],
      },
      take: 120,
      orderBy: { createdAt: 'desc' },
      include: {
        hostel: { select: { name: true } },
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
    prisma.gateMovementLog.findMany({
      where: {
        ...hw,
        OR: [{ actualDeparture: inDay }, { actualReturn: inDay }],
      },
      take: 120,
      orderBy: { actualDeparture: 'desc' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        hostel: { select: { name: true } },
      },
    }),
    prisma.leaveApplication.findMany({
      where: {
        ...hw,
        OR: [
          { createdAt: inDay },
          { reviewedAt: inDay },
          { departureDate: attendanceDay },
          { expectedReturnDate: attendanceDay },
        ],
      },
      take: 80,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        hostel: { select: { name: true } },
      },
    }),
    prisma.outingRequest.findMany({
      where: {
        ...hw,
        OR: [{ createdAt: inDay }, { outingDate: attendanceDay }],
      },
      take: 60,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        hostel: { select: { name: true } },
      },
    }),
    prisma.complaintTicket.findMany({
      where: { ...hw, createdAt: inDay },
      take: 60,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        hostel: { select: { name: true } },
      },
    }),
    prisma.emergencyIncident.findMany({
      where: { ...hw, createdAt: inDay },
      take: 40,
      orderBy: { createdAt: 'desc' },
      include: { hostel: { select: { name: true } } },
    }),
  ]);

  for (const row of corrections) {
    const resident = studentDisplayName(row.attendance.student);
    entries.push({
      id: `att-cor-${row.id}`,
      occurredAt: row.correctedAt.toISOString(),
      category: 'Attendance',
      headline: `Attendance corrected · ${row.newStatus.replace(/_/g, ' ')}`,
      detail: `Was ${row.previousStatus.replace(/_/g, ' ')} — ${row.reason}`,
      resident,
      location: row.attendance.hostel.name,
      linkPath: '/warden/attendance',
    });
  }

  for (const row of discrepancies) {
    entries.push({
      id: `att-dis-${row.id}`,
      occurredAt: row.createdAt.toISOString(),
      category: 'Attendance',
      headline: 'Attendance discrepancy filed',
      detail: row.explanation,
      resident: studentDisplayName(row.student),
      location: row.attendance.hostel.name,
      linkPath: '/warden/attendance',
    });
  }

  for (const row of visitors) {
    const resident = studentDisplayName(row.student);
    const base = {
      resident,
      location: row.hostel.name,
      linkPath: '/warden/visitors',
    };
    entries.push({
      id: `vis-reg-${row.id}`,
      occurredAt: row.createdAt.toISOString(),
      category: 'Visitor',
      headline: `Visitor registered · ${row.visitorName}`,
      detail: `Purpose: ${row.purpose} · Host ${resident}`,
      ...base,
    });
    if (row.checkInTime && row.checkInTime >= start && row.checkInTime < end) {
      entries.push({
        id: `vis-in-${row.id}`,
        occurredAt: row.checkInTime.toISOString(),
        category: 'Visitor',
        headline: `Checked in · ${row.visitorName}`,
        detail: `Meeting ${resident}`,
        ...base,
      });
    }
    if (row.checkOutTime && row.checkOutTime >= start && row.checkOutTime < end) {
      entries.push({
        id: `vis-out-${row.id}`,
        occurredAt: row.checkOutTime.toISOString(),
        category: 'Visitor',
        headline: `Checked out · ${row.visitorName}`,
        detail: `Visit completed for ${resident}`,
        ...base,
      });
    }
  }

  for (const row of movements) {
    const resident = studentDisplayName(row.student);
    const base = { resident, location: row.hostel.name, linkPath: '/warden/leave' };
    if (row.actualDeparture && row.actualDeparture >= start && row.actualDeparture < end) {
      entries.push({
        id: `mov-out-${row.id}`,
        occurredAt: row.actualDeparture.toISOString(),
        category: 'Movement',
        headline: 'Gate departure logged',
        detail: row.isLateReturn ? 'Late return flagged on prior movement' : 'Resident exited with valid pass',
        ...base,
      });
    }
    if (row.actualReturn && row.actualReturn >= start && row.actualReturn < end) {
      entries.push({
        id: `mov-in-${row.id}`,
        occurredAt: row.actualReturn.toISOString(),
        category: 'Movement',
        headline: row.isLateReturn ? 'Late return recorded' : 'Gate return logged',
        detail: 'Resident re-entered hostel',
        ...base,
      });
    }
  }

  for (const row of leaves) {
    const resident = studentDisplayName(row.student);
    const base = { resident, location: row.hostel.name, linkPath: '/warden/leave' };
    entries.push({
      id: `lve-${row.id}-created`,
      occurredAt: row.createdAt.toISOString(),
      category: 'Leave',
      headline: `Leave ${row.leaveType.replace(/_/g, ' ')} submitted`,
      detail: `${row.status} · returns ${row.expectedReturnDate.toISOString().slice(0, 10)}`,
      ...base,
    });
    if (row.reviewedAt && row.reviewedAt >= start && row.reviewedAt < end) {
      entries.push({
        id: `lve-${row.id}-review`,
        occurredAt: row.reviewedAt.toISOString(),
        category: 'Leave',
        headline: `Leave decision · ${row.status}`,
        detail: `Destination: ${row.destination}`,
        ...base,
      });
    }
  }

  for (const row of outings) {
    const resident = studentDisplayName(row.student);
    entries.push({
      id: `out-${row.id}`,
      occurredAt: row.createdAt.toISOString(),
      category: 'Leave',
      headline: row.isExceptional ? 'Exceptional outing request' : 'Daily outing request',
      detail: `${row.destination} · ${row.status}`,
      resident,
      location: row.hostel.name,
      linkPath: '/warden/leave',
    });
  }

  for (const row of complaints) {
    const resident = studentDisplayName(row.student);
    entries.push({
      id: `cmp-${row.id}`,
      occurredAt: row.createdAt.toISOString(),
      category: 'Complaint',
      headline: row.title,
      detail: `${row.category.replace(/_/g, ' ')} · ${row.status} · ${row.location}`,
      resident,
      location: row.hostel.name,
      linkPath: `/warden/complaints/${row.id}`,
    });
  }

  for (const row of incidents) {
    entries.push({
      id: `inc-${row.id}`,
      occurredAt: row.createdAt.toISOString(),
      category: 'Incident',
      headline: row.title,
      detail: `${row.incidentType.replace(/_/g, ' ')} · ${row.status} · ${row.location}`,
      location: row.hostel.name,
      linkPath: `/warden/incidents/${row.id}`,
    });
  }

  return pushAndSort(entries);
}
