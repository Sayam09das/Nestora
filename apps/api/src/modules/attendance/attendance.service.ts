import type { AttendanceStatus, Prisma, PrismaClient } from '@nestora/database';
import { BadRequestError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
import { formatFloorLabel } from '../rooms/rooms.service.js';

export type AttendanceUiMark = 'Present' | 'Absent' | 'On Leave' | 'Unmarked';

export type NightAttendanceRosterRow = {
  id: string;
  studentId: string;
  studentName: string;
  hostel: string;
  block: string;
  floor: string;
  roomNumber: string;
  mark: AttendanceUiMark;
  onApprovedLeave: boolean;
  consecutiveUnexplained: number;
};

export type NightAttendanceSessionRow = {
  id: string;
  date: string;
  hostel: string;
  block: string;
  floor: string;
  submittedBy: string;
  submittedAt: string;
  present: number;
  absent: number;
  onLeave: number;
  totalResidents: number;
  status: 'Draft' | 'Published';
};

export type NightAttendanceSummary = {
  generatedAt: string;
  sessionDate: string;
  todayRatePct: number | null;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  unexplainedAbsent: number;
  openDisputes: number;
  residentsTotal: number;
  unmarked: number;
  facets: {
    hostels: string[];
    blocks: string[];
    floors: string[];
  };
};

const LEAVE_APPROVED = 'APPROVED';
const CONSECUTIVE_LOOKBACK_DAYS = 7;

const residentInclude = {
  student: {
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  },
  bed: {
    include: {
      room: {
        include: {
          floor: {
            include: {
              block: {
                include: {
                  building: {
                    include: { hostel: { select: { id: true, name: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.AllocationRecordInclude;

type ResidentRow = Prisma.AllocationRecordGetPayload<{ include: typeof residentInclude }>;

function parseIsoDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new BadRequestError('Invalid session date.');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new BadRequestError('Invalid session date.');
  }
  return new Date(Date.UTC(year, month - 1, day));
}

function isoFromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function attendanceRatePercent(present: number, absent: number, onLeave: number): number | null {
  const total = present + absent + onLeave;
  if (total === 0) {
    return null;
  }
  return Math.round((present / total) * 1000) / 10;
}

function mapStatusToMark(status: AttendanceStatus): AttendanceUiMark {
  switch (status) {
    case 'PRESENT':
      return 'Present';
    case 'ABSENT':
      return 'Absent';
    case 'ON_LEAVE':
      return 'On Leave';
    default:
      return 'Unmarked';
  }
}

function mapMarkToStatus(mark: 'Present' | 'Absent' | 'On Leave'): AttendanceStatus {
  switch (mark) {
    case 'Present':
      return 'PRESENT';
    case 'Absent':
      return 'ABSENT';
    case 'On Leave':
      return 'ON_LEAVE';
  }
}

function studentDisplayId(student: ResidentRow['student']): string {
  return student.registrationNumber ?? `STU-${student.id.slice(0, 8).toUpperCase()}`;
}

function studentDisplayName(student: ResidentRow['student']): string {
  const first = student.user.firstName?.trim() ?? '';
  const last = student.user.lastName?.trim() ?? '';
  return `${first} ${last}`.trim() || 'Resident';
}

function residentLocation(row: ResidentRow): {
  hostel: string;
  hostelId: string;
  block: string;
  floor: string;
  roomNumber: string;
} {
  const room = row.bed.room;
  return {
    hostel: room.floor.block.building.hostel.name,
    hostelId: room.floor.block.building.hostel.id,
    block: room.floor.block.name,
    floor: formatFloorLabel(room.floor),
    roomNumber: room.roomNumber,
  };
}

function filterResidentsByScope(rows: ResidentRow[], scopeHostelNames?: string[]): ResidentRow[] {
  if (!scopeHostelNames?.length) {
    return rows;
  }
  return rows.filter((r) => {
    const hostel = r.bed.room.floor.block.building.hostel.name;
    return hostelNameInScope(hostel, scopeHostelNames);
  });
}

async function loadActiveResidents(prisma: PrismaClient, sessionDate: Date): Promise<ResidentRow[]> {
  return prisma.allocationRecord.findMany({
    where: {
      status: 'ACTIVE',
      startDate: { lte: sessionDate },
      OR: [{ endDate: null }, { endDate: { gte: sessionDate } }],
    },
    include: residentInclude,
    orderBy: [{ bed: { room: { roomNumber: 'asc' } } }],
  });
}

async function loadApprovedLeaveStudentIds(
  prisma: PrismaClient,
  sessionDate: Date,
  studentIds: string[],
): Promise<Set<string>> {
  if (studentIds.length === 0) {
    return new Set();
  }
  const leaves = await prisma.leaveApplication.findMany({
    where: {
      studentId: { in: studentIds },
      status: LEAVE_APPROVED,
      departureDate: { lte: sessionDate },
      expectedReturnDate: { gte: sessionDate },
    },
    select: { studentId: true },
  });
  return new Set(leaves.map((l) => l.studentId));
}

async function loadAttendanceForStudents(
  prisma: PrismaClient,
  sessionDate: Date,
  studentIds: string[],
): Promise<Map<string, { status: AttendanceStatus; id: string }>> {
  if (studentIds.length === 0) {
    return new Map();
  }
  const records = await prisma.attendanceRecord.findMany({
    where: {
      studentId: { in: studentIds },
      attendanceDate: sessionDate,
    },
    select: { id: true, studentId: true, status: true },
  });
  return new Map(records.map((r) => [r.studentId, { status: r.status, id: r.id }]));
}

export async function loadConsecutiveUnexplainedMap(
  prisma: PrismaClient,
  studentIds: string[],
  sessionDate: Date,
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (studentIds.length === 0) {
    return result;
  }

  const from = new Date(sessionDate);
  from.setUTCDate(from.getUTCDate() - CONSECUTIVE_LOOKBACK_DAYS);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      studentId: { in: studentIds },
      attendanceDate: { gte: from, lte: sessionDate },
      status: 'ABSENT',
    },
    include: {
      discrepancies: { where: { status: 'RESOLVED' }, take: 1 },
    },
  });

  const byStudent = new Map<string, Map<string, (typeof records)[number]>>();
  for (const rec of records) {
    const dayKey = isoFromDate(rec.attendanceDate);
    const map = byStudent.get(rec.studentId) ?? new Map();
    map.set(dayKey, rec);
    byStudent.set(rec.studentId, map);
  }

  for (const studentId of studentIds) {
    const byDay = byStudent.get(studentId);
    if (!byDay) {
      result.set(studentId, 0);
      continue;
    }
    let streak = 0;
    let cursor = sessionDate.getTime();
    for (let i = 0; i < CONSECUTIVE_LOOKBACK_DAYS; i++) {
      const dayKey = isoFromDate(new Date(cursor));
      const rec = byDay.get(dayKey);
      if (!rec || rec.discrepancies.length > 0) {
        break;
      }
      streak += 1;
      cursor -= 24 * 60 * 60 * 1000;
    }
    result.set(studentId, streak);
  }

  return result;
}

async function buildRosterRows(
  prisma: PrismaClient,
  residents: ResidentRow[],
  sessionDate: Date,
  attendanceMap: Map<string, { status: AttendanceStatus; id: string }>,
  onLeaveIds: Set<string>,
): Promise<NightAttendanceRosterRow[]> {
  const absentStudentIds = residents
    .map((a) => a.student.id)
    .filter((id) => {
      const stored = attendanceMap.get(id);
      return stored?.status === 'ABSENT';
    });
  const streakMap = await loadConsecutiveUnexplainedMap(prisma, absentStudentIds, sessionDate);

  const rows: NightAttendanceRosterRow[] = [];
  for (const alloc of residents) {
    const loc = residentLocation(alloc);
    const student = alloc.student;
    const onApprovedLeave = onLeaveIds.has(student.id);
    const stored = attendanceMap.get(student.id);
    let mark: AttendanceUiMark = stored ? mapStatusToMark(stored.status) : 'Unmarked';
    if (!stored && onApprovedLeave) {
      mark = 'On Leave';
    }

    const consecutiveUnexplained = mark === 'Absent' ? (streakMap.get(student.id) ?? 0) : 0;

    rows.push({
      id: student.id,
      studentId: studentDisplayId(student),
      studentName: studentDisplayName(student),
      hostel: loc.hostel,
      block: loc.block,
      floor: loc.floor,
      roomNumber: loc.roomNumber,
      mark,
      onApprovedLeave,
      consecutiveUnexplained,
    });
  }
  return rows;
}

function summarizeRoster(
  roster: NightAttendanceRosterRow[],
  openDisputes: number,
  sessionDate: string,
): NightAttendanceSummary {
  let presentToday = 0;
  let absentToday = 0;
  let onLeaveToday = 0;
  let unmarked = 0;
  let unexplainedAbsent = 0;

  const hostels = new Set<string>();
  const blocks = new Set<string>();
  const floors = new Set<string>();

  for (const row of roster) {
    hostels.add(row.hostel);
    blocks.add(row.block);
    floors.add(row.floor);
    switch (row.mark) {
      case 'Present':
        presentToday += 1;
        break;
      case 'Absent':
        absentToday += 1;
        if (row.consecutiveUnexplained > 0) {
          unexplainedAbsent += 1;
        }
        break;
      case 'On Leave':
        onLeaveToday += 1;
        break;
      default:
        unmarked += 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    sessionDate,
    todayRatePct: attendanceRatePercent(presentToday, absentToday, onLeaveToday),
    presentToday,
    absentToday,
    onLeaveToday,
    unexplainedAbsent,
    openDisputes,
    residentsTotal: roster.length,
    unmarked,
    facets: {
      hostels: [...hostels].sort(),
      blocks: [...blocks].sort(),
      floors: [...floors].sort(),
    },
  };
}

async function buildRecentSessions(
  prisma: PrismaClient,
  scopeHostelNames: string[] | undefined,
  beforeDate: Date,
): Promise<NightAttendanceSessionRow[]> {
  const from = new Date(beforeDate);
  from.setUTCDate(from.getUTCDate() - 14);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      attendanceDate: { gte: from, lt: beforeDate },
      ...(scopeHostelNames?.length
        ? { hostel: { name: { in: scopeHostelNames } } }
        : undefined),
    },
    include: {
      hostel: { select: { name: true } },
      student: {
        include: {
          allocationRecords: {
            where: { status: 'ACTIVE' },
            take: 1,
            include: {
              bed: {
                include: {
                  room: {
                    include: {
                      floor: { include: { block: { select: { name: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { attendanceDate: 'desc' },
  });

  type GroupKey = string;
  const groups = new Map<
    GroupKey,
    {
      date: string;
      hostel: string;
      block: string;
      floor: string;
      present: number;
      absent: number;
      onLeave: number;
      latestAt: Date;
    }
  >();

  for (const rec of records) {
    const alloc = rec.student.allocationRecords[0];
    const block = alloc?.bed.room.floor.block.name ?? '—';
    const floor = alloc ? formatFloorLabel(alloc.bed.room.floor) : '—';
    const date = isoFromDate(rec.attendanceDate);
    const key = `${date}|${rec.hostel.name}|${block}|${floor}`;
    const group = groups.get(key) ?? {
      date,
      hostel: rec.hostel.name,
      block,
      floor,
      present: 0,
      absent: 0,
      onLeave: 0,
      latestAt: rec.recordedAt,
    };
    if (rec.status === 'PRESENT') group.present += 1;
    if (rec.status === 'ABSENT') group.absent += 1;
    if (rec.status === 'ON_LEAVE') group.onLeave += 1;
    if (rec.recordedAt > group.latestAt) {
      group.latestAt = rec.recordedAt;
    }
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((g) => {
      const totalResidents = g.present + g.absent + g.onLeave;
      return {
        id: `${g.date}:${g.hostel}:${g.block}:${g.floor}`,
        date: g.date,
        hostel: g.hostel,
        block: g.block,
        floor: g.floor,
        submittedBy: 'Hostel staff',
        submittedAt: g.latestAt.toISOString(),
        present: g.present,
        absent: g.absent,
        onLeave: g.onLeave,
        totalResidents,
        status: 'Published' as const,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.hostel.localeCompare(b.hostel))
    .slice(0, 24);
}

export async function getNightAttendanceSession(
  prisma: PrismaClient,
  dateIso: string,
  scopeHostelNames?: string[],
): Promise<{
  summary: NightAttendanceSummary;
  roster: NightAttendanceRosterRow[];
  sessions: NightAttendanceSessionRow[];
}> {
  const sessionDate = parseIsoDate(dateIso);
  const residentsAll = await loadActiveResidents(prisma, sessionDate);
  const residents = filterResidentsByScope(residentsAll, scopeHostelNames);
  const studentIds = residents.map((r) => r.student.id);

  const [attendanceMap, onLeaveIds, openDisputes] = await Promise.all([
    loadAttendanceForStudents(prisma, sessionDate, studentIds),
    loadApprovedLeaveStudentIds(prisma, sessionDate, studentIds),
    prisma.attendanceDiscrepancy.count({
      where: {
        status: 'PENDING',
        ...(studentIds.length ? { studentId: { in: studentIds } } : { studentId: { in: [] } }),
      },
    }),
  ]);

  const roster = await buildRosterRows(prisma, residents, sessionDate, attendanceMap, onLeaveIds);
  const summary = summarizeRoster(roster, openDisputes, dateIso);
  const sessions = await buildRecentSessions(prisma, scopeHostelNames, sessionDate);

  return { summary, roster, sessions };
}

export async function upsertNightAttendanceMark(
  prisma: PrismaClient,
  params: {
    dateIso: string;
    studentId: string;
    mark: 'Present' | 'Absent' | 'On Leave';
    recordedBy: string;
    scopeHostelNames?: string[];
  },
): Promise<NightAttendanceRosterRow> {
  const sessionDate = parseIsoDate(params.dateIso);
  const status = mapMarkToStatus(params.mark);

  const allocation = await prisma.allocationRecord.findFirst({
    where: {
      studentId: params.studentId,
      status: 'ACTIVE',
      startDate: { lte: sessionDate },
      OR: [{ endDate: null }, { endDate: { gte: sessionDate } }],
    },
    include: residentInclude,
  });

  if (!allocation) {
    throw new BadRequestError('Student is not an active resident for this session date.');
  }

  const loc = residentLocation(allocation);
  if (
    params.scopeHostelNames?.length &&
    !hostelNameInScope(loc.hostel, params.scopeHostelNames)
  ) {
    throw new BadRequestError('Student is outside your hostel scope.');
  }

  await prisma.attendanceRecord.upsert({
    where: {
      studentId_attendanceDate: {
        studentId: params.studentId,
        attendanceDate: sessionDate,
      },
    },
    create: {
      studentId: params.studentId,
      hostelId: loc.hostelId,
      attendanceDate: sessionDate,
      status,
      recordedBy: params.recordedBy,
    },
    update: {
      status,
      recordedBy: params.recordedBy,
      recordedAt: new Date(),
    },
  });

  const session = await getNightAttendanceSession(
    prisma,
    params.dateIso,
    params.scopeHostelNames,
  );
  const row = session.roster.find((r) => r.id === params.studentId);
  if (!row) {
    throw new BadRequestError('Could not load updated roster row.');
  }
  return row;
}

export async function clearNightAttendanceMark(
  prisma: PrismaClient,
  params: {
    dateIso: string;
    studentId: string;
    scopeHostelNames?: string[];
  },
): Promise<void> {
  const sessionDate = parseIsoDate(params.dateIso);

  const allocation = await prisma.allocationRecord.findFirst({
    where: {
      studentId: params.studentId,
      status: 'ACTIVE',
      startDate: { lte: sessionDate },
      OR: [{ endDate: null }, { endDate: { gte: sessionDate } }],
    },
    include: residentInclude,
  });

  if (!allocation) {
    throw new BadRequestError('Student is not an active resident for this session date.');
  }

  const loc = residentLocation(allocation);
  if (
    params.scopeHostelNames?.length &&
    !hostelNameInScope(loc.hostel, params.scopeHostelNames)
  ) {
    throw new BadRequestError('Student is outside your hostel scope.');
  }

  await prisma.attendanceRecord.deleteMany({
    where: {
      studentId: params.studentId,
      attendanceDate: sessionDate,
    },
  });
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export type ConsecutiveAbsenceAlert = {
  studentId: string;
  hostelId: string;
  studentName: string;
  streak: number;
};

export async function scanConsecutiveAbsenceAlerts(
  prisma: PrismaClient,
  threshold: number,
): Promise<ConsecutiveAbsenceAlert[]> {
  const sessionDate = startOfTodayUtc();
  const residents = await prisma.allocationRecord.findMany({
    where: { status: 'ACTIVE' },
    select: {
      studentId: true,
      student: {
        select: {
          registrationNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      bed: {
        select: {
          room: {
            select: {
              floor: {
                select: {
                  block: {
                    select: {
                      building: { select: { hostelId: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (residents.length === 0) return [];

  const absentToday = await prisma.attendanceRecord.findMany({
    where: {
      attendanceDate: sessionDate,
      status: 'ABSENT',
      studentId: { in: residents.map((r) => r.studentId) },
    },
    select: { studentId: true },
  });
  const absentIds = new Set(absentToday.map((r) => r.studentId));
  const candidates = residents.filter((r) => absentIds.has(r.studentId));
  if (candidates.length === 0) return [];

  const streakMap = await loadConsecutiveUnexplainedMap(
    prisma,
    candidates.map((c) => c.studentId),
    sessionDate,
  );

  const alerts: ConsecutiveAbsenceAlert[] = [];
  for (const row of candidates) {
    const streak = streakMap.get(row.studentId) ?? 0;
    if (streak < threshold) continue;
    const studentName =
      `${row.student.user.firstName ?? ''} ${row.student.user.lastName ?? ''}`.trim() ||
      row.student.registrationNumber;
    alerts.push({
      studentId: row.studentId,
      hostelId: row.bed.room.floor.block.building.hostelId,
      studentName,
      streak,
    });
  }
  return alerts;
}
