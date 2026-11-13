import type { Prisma, PrismaClient } from '@nestora/database';
import type { AssignComplaintTicketBody, ComplaintsDeskListQuery } from '@nestora/validators';
import { BadRequestError, InternalError, NotFoundError } from '../../common/errors/index.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';

export type ComplaintUiStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export type ComplaintUiCategory = 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleaning' | 'Civil';
export type ComplaintUiPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintDeskTicket = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ComplaintUiCategory;
  location: string;
  hostel: string;
  block: string;
  studentName: string;
  studentId: string;
  suggestedPriority: ComplaintUiPriority;
  finalPriority: ComplaintUiPriority | null;
  status: ComplaintUiStatus;
  assignedStaff: string | null;
  hasPhoto: boolean;
  openedAt: string;
  updatedAt: string;
  slaHours: number;
  slaBreached: boolean;
};

export type ComplaintsDeskSummary = {
  generatedAt: string;
  openTickets: number;
  slaAtRisk: number;
  resolvedThisWeek: number;
  avgTurnaroundHours: number;
  reopened: number;
  categoryHotspot: string;
  facets: {
    hostels: string[];
    categories: ComplaintUiCategory[];
  };
};

export type ComplaintTimelineEntry = {
  id: string;
  ticketId: string;
  status: ComplaintUiStatus;
  actor: string;
  notes: string | null;
  at: string;
};

const OPEN_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'REOPENED',
] as const;

const SLA_HOURS: Record<ComplaintUiPriority, number> = {
  Low: 72,
  Medium: 48,
  High: 24,
  Critical: 12,
};

const ticketInclude = {
  hostel: { select: { name: true } },
  student: {
    include: {
      user: { select: { firstName: true, lastName: true } },
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
  attachments: { select: { id: true }, take: 1 },
  assignments: {
    where: { isActive: true },
    take: 1,
    orderBy: { assignedAt: 'desc' as const },
  },
} satisfies Prisma.ComplaintTicketInclude;

type TicketRow = Prisma.ComplaintTicketGetPayload<{ include: typeof ticketInclude }>;

function mapDbStatus(status: string): ComplaintUiStatus {
  const map: Record<string, ComplaintUiStatus> = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Resolved',
    REJECTED: 'Rejected',
    REOPENED: 'Reopened',
  };
  return map[status.toUpperCase()] ?? 'Submitted';
}

function priorityToDb(priority: ComplaintUiPriority): string {
  return priority.toUpperCase();
}

function mapDbPriority(value: string): ComplaintUiPriority {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'low') return 'Low';
  if (normalized === 'high') return 'High';
  if (normalized === 'critical') return 'Critical';
  return 'Medium';
}

function mapDbCategory(value: string): ComplaintUiCategory {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('plumb')) return 'Plumbing';
  if (normalized.includes('carp')) return 'Carpentry';
  if (normalized.includes('clean')) return 'Cleaning';
  if (normalized.includes('civil') || normalized.includes('paint')) return 'Civil';
  return 'Electrical';
}

function studentDisplayName(student: TicketRow['student']): string {
  const first = student.user.firstName?.trim() ?? '';
  const last = student.user.lastName?.trim() ?? '';
  return `${first} ${last}`.trim() || 'Resident';
}

function blockLabel(ticket: TicketRow): string {
  const block = ticket.student.allocationRecords[0]?.bed.room.floor.block.name;
  if (block) return block;
  const match = /block\s+([^\s·]+)/i.exec(ticket.location);
  return match?.[1] ? `Block ${match[1]}` : '—';
}

function effectivePriority(
  suggested: ComplaintUiPriority,
  final: string | null,
): ComplaintUiPriority {
  return final ? mapDbPriority(final) : suggested;
}

async function staffNameForId(prisma: PrismaClient, staffId: string | undefined): Promise<string | null> {
  if (!staffId) return null;
  const user = await prisma.user.findUnique({
    where: { id: staffId },
    select: { firstName: true, lastName: true },
  });
  if (!user) return null;
  const first = user.firstName?.trim() ?? '';
  const last = user.lastName?.trim() ?? '';
  const name = `${first} ${last}`.trim();
  return name || null;
}

function mapTicketRowSync(row: TicketRow, staffNames: Map<string, string>): ComplaintDeskTicket {
  const suggested = mapDbPriority(row.suggestedPriority);
  const final = row.finalPriority ? mapDbPriority(row.finalPriority) : null;
  const priority = effectivePriority(suggested, row.finalPriority);
  const slaHours = SLA_HOURS[priority];
  const openedAt = row.createdAt.toISOString();
  const elapsed = (Date.now() - row.createdAt.getTime()) / 3_600_000;
  const staffId = row.assignments[0]?.staffId;
  const staffName = staffId ? (staffNames.get(staffId) ?? null) : null;

  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    title: row.title,
    description: row.description,
    category: mapDbCategory(row.category),
    location: row.location,
    hostel: row.hostel.name,
    block: blockLabel(row),
    studentName: studentDisplayName(row.student),
    studentId: row.student.registrationNumber,
    suggestedPriority: suggested,
    finalPriority: final,
    status: mapDbStatus(row.status),
    assignedStaff: staffName,
    hasPhoto: row.attachments.length > 0,
    openedAt,
    updatedAt: row.updatedAt.toISOString(),
    slaHours,
    slaBreached: elapsed > slaHours,
  };
}

async function loadStaffNameMap(prisma: PrismaClient, staffIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!staffIds.length) return map;
  const users = await prisma.user.findMany({
    where: { id: { in: staffIds } },
    select: { id: true, firstName: true, lastName: true },
  });
  for (const user of users) {
    const first = user.firstName?.trim() ?? '';
    const last = user.lastName?.trim() ?? '';
    const name = `${first} ${last}`.trim();
    if (name) map.set(user.id, name);
  }
  return map;
}

function matchesQuery(ticket: ComplaintDeskTicket, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    ticket.title.toLowerCase().includes(needle) ||
    ticket.ticketNumber.toLowerCase().includes(needle) ||
    ticket.studentName.toLowerCase().includes(needle) ||
    ticket.studentId.toLowerCase().includes(needle) ||
    ticket.location.toLowerCase().includes(needle)
  );
}

export async function getComplaintsDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
): Promise<ComplaintsDeskSummary> {
  const hostelWhere =
    scopeHostelNames?.length ? { hostel: { name: { in: scopeHostelNames } } } : undefined;

  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);

  const [openRows, resolvedWeek, reopenedCount, allOpenForHotspot] = await Promise.all([
    prisma.complaintTicket.findMany({
      where: {
        status: { in: [...OPEN_STATUSES] },
        ...hostelWhere,
      },
      select: {
        id: true,
        status: true,
        category: true,
        createdAt: true,
        suggestedPriority: true,
        finalPriority: true,
      },
    }),
    prisma.complaintTicket.findMany({
      where: {
        status: { in: ['RESOLVED', 'CLOSED'] },
        updatedAt: { gte: weekStart },
        ...hostelWhere,
      },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.complaintTicket.count({
      where: { status: 'REOPENED', ...hostelWhere },
    }),
    prisma.complaintTicket.findMany({
      where: {
        status: { in: [...OPEN_STATUSES] },
        ...hostelWhere,
      },
      select: { category: true },
    }),
  ]);

  const mappedOpen = openRows.map((row) => {
    const suggested = mapDbPriority(row.suggestedPriority);
    const priority = effectivePriority(suggested, row.finalPriority);
    const slaHours = SLA_HOURS[priority];
    const elapsed = (Date.now() - row.createdAt.getTime()) / 3_600_000;
    return {
      slaAtRisk: elapsed >= slaHours * 0.75,
    };
  });

  const slaAtRisk = mappedOpen.filter((r) => r.slaAtRisk).length;

  let avgTurnaroundHours = 0;
  if (resolvedWeek.length > 0) {
    const totalHours = resolvedWeek.reduce((sum, t) => {
      return sum + (t.updatedAt.getTime() - t.createdAt.getTime()) / 3_600_000;
    }, 0);
    avgTurnaroundHours = Math.round(totalHours / resolvedWeek.length);
  }

  const categoryCounts = new Map<string, number>();
  for (const row of allOpenForHotspot) {
    const cat = mapDbCategory(row.category);
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }
  let categoryHotspot = 'Electrical';
  let max = 0;
  for (const [cat, count] of categoryCounts) {
    if (count > max) {
      max = count;
      categoryHotspot = cat;
    }
  }

  const hostels = scopeHostelNames?.length
    ? [...scopeHostelNames].sort()
    : [...new Set((await prisma.hostel.findMany({ select: { name: true } })).map((h) => h.name))].sort();

  return {
    generatedAt: new Date().toISOString(),
    openTickets: openRows.length,
    slaAtRisk,
    resolvedThisWeek: resolvedWeek.length,
    avgTurnaroundHours,
    reopened: reopenedCount,
    categoryHotspot,
    facets: {
      hostels,
      categories: ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Civil'],
    },
  };
}

export async function listComplaintsDeskTickets(
  prisma: PrismaClient,
  query: ComplaintsDeskListQuery,
  scopeHostelNames?: string[],
): Promise<{
  tickets: ComplaintDeskTicket[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const pagination = normalizePagination(query.page ?? DEFAULT_PAGE, query.limit ?? 100);

  const rows = await prisma.complaintTicket.findMany({
    where: scopeHostelNames?.length ? { hostel: { name: { in: scopeHostelNames } } } : undefined,
    include: ticketInclude,
    orderBy: { updatedAt: 'desc' },
  });

  const staffIds = [
    ...new Set(rows.map((r) => r.assignments[0]?.staffId).filter((id): id is string => Boolean(id))),
  ];
  const staffNames = await loadStaffNameMap(prisma, staffIds);
  const mapped = rows.map((row) => mapTicketRowSync(row, staffNames));

  let filtered = mapped;
  if (query.hostel && query.hostel !== 'All Hostels') {
    filtered = filtered.filter((t) => t.hostel === query.hostel);
  }
  if (query.category) {
    filtered = filtered.filter((t) => t.category === query.category);
  }
  if (query.priority) {
    filtered = filtered.filter(
      (t) => (t.finalPriority ?? t.suggestedPriority) === query.priority,
    );
  }
  if (query.status) {
    filtered = filtered.filter((t) => t.status === query.status);
  }
  if (query.q?.trim()) {
    filtered = filtered.filter((t) => matchesQuery(t, query.q!.trim()));
  }

  const total = filtered.length;
  const start = (pagination.page - 1) * pagination.limit;
  const tickets = filtered.slice(start, start + pagination.limit);

  return {
    tickets,
    pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
  };
}

export async function getComplaintDeskTicketById(
  prisma: PrismaClient,
  ticketId: string,
  scopeHostelNames?: string[],
): Promise<{ ticket: ComplaintDeskTicket; timeline: ComplaintTimelineEntry[] } | null> {
  const row = await prisma.complaintTicket.findUnique({
    where: { id: ticketId },
    include: {
      ...ticketInclude,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!row) return null;
  if (scopeHostelNames?.length && !hostelNameInScope(row.hostel.name, scopeHostelNames)) {
    return null;
  }

  const staffNames = await loadStaffNameMap(
    prisma,
    row.assignments.map((a) => a.staffId),
  );
  const ticket = mapTicketRowSync(row, staffNames);
  const actorCache = new Map<string, string>();

  const timeline: ComplaintTimelineEntry[] = [];
  for (const entry of row.statusHistory) {
    let actor = actorCache.get(entry.changedBy);
    if (!actor) {
      actor = (await staffNameForId(prisma, entry.changedBy)) ?? 'System';
      actorCache.set(entry.changedBy, actor);
    }
    timeline.push({
      id: entry.id,
      ticketId: row.id,
      status: mapDbStatus(entry.status),
      actor,
      notes: entry.notes,
      at: entry.createdAt.toISOString(),
    });
  }

  if (timeline.length === 0) {
    timeline.push({
      id: `${row.id}-opened`,
      ticketId: row.id,
      status: mapDbStatus(row.status),
      actor: studentDisplayName(row.student),
      notes: 'Ticket opened.',
      at: row.createdAt.toISOString(),
    });
  }

  return { ticket, timeline };
}

const ASSIGNABLE_STATUSES = new Set(['SUBMITTED', 'UNDER_REVIEW', 'REOPENED', 'ASSIGNED']);

export async function assignComplaintTicket(
  prisma: PrismaClient,
  ticketId: string,
  body: AssignComplaintTicketBody,
  assignedByUserId: string,
  scopeHostelNames?: string[],
): Promise<ComplaintDeskTicket> {
  const ticket = await prisma.complaintTicket.findUnique({
    where: { id: ticketId },
    include: { hostel: { select: { name: true } } },
  });
  if (!ticket) {
    throw new NotFoundError('Complaint ticket not found.');
  }
  if (scopeHostelNames?.length && !hostelNameInScope(ticket.hostel.name, scopeHostelNames)) {
    throw new NotFoundError('Complaint ticket not found.');
  }
  const status = ticket.status.toUpperCase();
  if (!ASSIGNABLE_STATUSES.has(status) && status !== 'IN_PROGRESS') {
    throw new BadRequestError('This ticket cannot be assigned in its current status.');
  }

  const staff = await prisma.user.findFirst({
    where: {
      id: body.staffUserId,
      role: { in: ['HOSTEL_STAFF', 'HOSTEL_WARDEN', 'SECURITY_GUARD'] },
      status: 'ACTIVE',
    },
    select: { id: true },
  });
  if (!staff) {
    throw new BadRequestError('Selected staff member is not eligible for ticket assignment.');
  }

  const finalPriority = priorityToDb(body.priority);

  await prisma.$transaction(async (tx) => {
    await tx.ticketAssignment.updateMany({
      where: { ticketId, isActive: true },
      data: { isActive: false },
    });
    await tx.ticketAssignment.create({
      data: {
        ticketId,
        staffId: body.staffUserId,
        assignedBy: assignedByUserId,
        isActive: true,
      },
    });
    await tx.complaintTicket.update({
      where: { id: ticketId },
      data: {
        finalPriority,
        status: 'ASSIGNED',
        updatedAt: new Date(),
      },
    });
    await tx.ticketStatusHistory.create({
      data: {
        ticketId,
        status: 'ASSIGNED',
        changedBy: assignedByUserId,
        notes: `Assigned to staff · priority ${body.priority}`,
      },
    });
  });

  const refreshed = await prisma.complaintTicket.findUnique({
    where: { id: ticketId },
    include: ticketInclude,
  });
  if (!refreshed) {
    throw new InternalError('Ticket could not be reloaded after assignment.');
  }
  const staffNames = await loadStaffNameMap(prisma, [body.staffUserId]);
  return mapTicketRowSync(refreshed, staffNames);
}
