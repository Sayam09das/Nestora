import type { Prisma, PrismaClient } from '@nestora/database';
import type { LeaveDeskListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';

export type LeaveUiStatus =
  | 'Pending Review'
  | 'Approved'
  | 'On Leave'
  | 'Returned'
  | 'Rejected'
  | 'Extension Pending'
  | 'Overstayed';

export type LeaveUiCategory = 'Medical' | 'Family' | 'Academic' | 'Emergency' | 'Personal';

export type LeaveDeskRecord = {
  id: string;
  leaveRef: string;
  studentId: string;
  studentName: string;
  hostel: string;
  block: string;
  roomBed: string;
  category: LeaveUiCategory;
  destination: string;
  reason: string;
  emergencyContact: string;
  departureDate: string;
  expectedReturnDate: string;
  status: LeaveUiStatus;
  submittedAt: string;
  reviewedBy: string | null;
  gatePassToken: string | null;
  bedRetained: boolean;
  hasExtension: boolean;
  lateReturn: boolean;
};

export type LeaveDeskSummary = {
  generatedAt: string;
  pendingReview: number;
  onLeaveNow: number;
  returningToday: number;
  extensionsPending: number;
  overstayed: number;
  approvedThisWeek: number;
  residentsTotal: number;
  onCampusPercent: number;
  facets: { hostels: string[]; categories: LeaveUiCategory[] };
};

export type LeaveTimelineEntry = {
  id: string;
  leaveId: string;
  action: string;
  actor: string;
  notes: string | null;
  at: string;
};

const PENDING_DB_STATUSES = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;

const leaveInclude = {
  student: {
    select: {
      registrationNumber: true,
      user: { select: { firstName: true, lastName: true } },
      allocationRecords: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          bed: {
            include: {
              room: {
                select: {
                  roomNumber: true,
                  floor: {
                    include: {
                      block: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  hostel: { select: { name: true } },
  extensions: { orderBy: { id: 'asc' as const } },
  gatePasses: {
    orderBy: { validFrom: 'desc' as const },
    take: 1,
    include: {
      movementLogs: {
        orderBy: { actualReturn: 'desc' as const },
        take: 1,
        select: { actualReturn: true, isLateReturn: true },
      },
    },
  },
} satisfies Prisma.LeaveApplicationInclude;

type LeaveRow = Prisma.LeaveApplicationGetPayload<{ include: typeof leaveInclude }>;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mapLeaveCategory(leaveType: string): LeaveUiCategory {
  const normalized = leaveType.trim();
  const direct: LeaveUiCategory[] = ['Medical', 'Family', 'Academic', 'Emergency', 'Personal'];
  if (direct.includes(normalized as LeaveUiCategory)) {
    return normalized as LeaveUiCategory;
  }
  const key = normalized.toLowerCase();
  if (key.includes('med')) return 'Medical';
  if (key.includes('fam')) return 'Family';
  if (key.includes('acad')) return 'Academic';
  if (key.includes('emer')) return 'Emergency';
  return 'Personal';
}

function studentDisplayName(row: LeaveRow): string {
  const first = row.student.user.firstName?.trim() ?? '';
  const last = row.student.user.lastName?.trim() ?? '';
  return `${first} ${last}`.trim() || 'Resident';
}

function roomBedLine(row: LeaveRow): { block: string; roomBed: string } {
  const alloc = row.student.allocationRecords[0];
  if (!alloc?.bed?.room) {
    return { block: '—', roomBed: '—' };
  }
  const block = alloc.bed.room.floor.block.name;
  const room = alloc.bed.room.roomNumber;
  const bedLabel = alloc.bed.bedNumber?.trim() || 'Bed';
  return { block, roomBed: `${room} · ${bedLabel}` };
}

function leaveRefFromRow(row: LeaveRow, sequence: number): string {
  const year = row.createdAt.getUTCFullYear();
  return `LV-${year}-${String(sequence).padStart(4, '0')}`;
}

type DerivedContext = {
  today: Date;
  hasPendingExtension: boolean;
  hasAnyExtension: boolean;
  actualReturn: Date | null;
  isLateReturn: boolean;
};

function deriveContext(row: LeaveRow, today: Date): DerivedContext {
  const hasPendingExtension = row.extensions.some((e) => e.status.toUpperCase() === 'PENDING');
  const hasAnyExtension = row.extensions.length > 0;
  const movement = row.gatePasses[0]?.movementLogs[0];
  return {
    today,
    hasPendingExtension,
    hasAnyExtension,
    actualReturn: movement?.actualReturn ?? null,
    isLateReturn: movement?.isLateReturn ?? false,
  };
}

export function deriveLeaveUiStatus(row: LeaveRow, todayInput?: Date): LeaveUiStatus {
  const today = startOfUtcDay(todayInput ?? new Date());
  const ctx = deriveContext(row, today);
  const dbStatus = row.status.toUpperCase();
  const departure = startOfUtcDay(row.departureDate);
  const expectedReturn = startOfUtcDay(row.expectedReturnDate);

  if (ctx.hasPendingExtension) {
    return 'Extension Pending';
  }

  if (dbStatus === 'REJECTED') {
    return 'Rejected';
  }

  if (PENDING_DB_STATUSES.includes(dbStatus as (typeof PENDING_DB_STATUSES)[number])) {
    return 'Pending Review';
  }

  if (ctx.actualReturn) {
    return 'Returned';
  }

  if (dbStatus === 'EXPIRED' || dbStatus === 'RETURNED') {
    return 'Returned';
  }

  if (dbStatus === 'APPROVED') {
    if (today.getTime() > expectedReturn.getTime()) {
      return 'Overstayed';
    }
    if (today.getTime() >= departure.getTime()) {
      return 'On Leave';
    }
    return 'Approved';
  }

  return 'Pending Review';
}

function mapLeaveRow(row: LeaveRow, sequence: number, today?: Date): LeaveDeskRecord {
  const { block, roomBed } = roomBedLine(row);
  const status = deriveLeaveUiStatus(row, today);
  const pass = row.gatePasses[0];
  const ctx = deriveContext(row, startOfUtcDay(today ?? new Date()));

  return {
    id: row.id,
    leaveRef: leaveRefFromRow(row, sequence),
    studentId: row.student.registrationNumber,
    studentName: studentDisplayName(row),
    hostel: row.hostel.name,
    block,
    roomBed,
    category: mapLeaveCategory(row.leaveType),
    destination: row.destination,
    reason: row.reason,
    emergencyContact: row.emergencyContact,
    departureDate: formatDateOnly(row.departureDate),
    expectedReturnDate: formatDateOnly(row.expectedReturnDate),
    status,
    submittedAt: row.createdAt.toISOString(),
    reviewedBy: null,
    gatePassToken: pass?.passToken ?? null,
    bedRetained: status !== 'Rejected',
    hasExtension: ctx.hasAnyExtension,
    lateReturn: ctx.isLateReturn || status === 'Overstayed',
  };
}

async function loadReviewerNames(
  prisma: PrismaClient,
  reviewerIds: string[],
): Promise<Map<string, string>> {
  if (reviewerIds.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: reviewerIds } },
    select: { id: true, firstName: true, lastName: true, role: true },
  });
  const map = new Map<string, string>();
  for (const u of users) {
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Warden';
    const role =
      u.role === 'HOSTEL_WARDEN' ? 'Warden' : u.role === 'UNIVERSITY_ADMINISTRATOR' ? 'Admin' : 'Staff';
    map.set(u.id, `${role} · ${name}`);
  }
  return map;
}

function attachReviewers(rows: LeaveDeskRecord[], dbRows: LeaveRow[], reviewers: Map<string, string>): LeaveDeskRecord[] {
  return rows.map((rec, i) => {
    const db = dbRows[i];
    const reviewedBy = db?.reviewedBy ? reviewers.get(db.reviewedBy) ?? 'Warden' : null;
    return { ...rec, reviewedBy };
  });
}

function matchesQuery(record: LeaveDeskRecord, q?: string): boolean {
  if (!q?.trim()) return true;
  const needle = q.trim().toLowerCase();
  return (
    record.studentName.toLowerCase().includes(needle) ||
    record.studentId.toLowerCase().includes(needle) ||
    record.leaveRef.toLowerCase().includes(needle) ||
    record.destination.toLowerCase().includes(needle)
  );
}

function hostelScopeWhere(scopeHostelNames?: string[]): Prisma.LeaveApplicationWhereInput | undefined {
  if (!scopeHostelNames?.length) return undefined;
  return { hostel: { name: { in: scopeHostelNames } } };
}

async function fetchLeaveRows(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<LeaveRow[]> {
  return prisma.leaveApplication.findMany({
    where: hostelScopeWhere(scopeHostelNames),
    include: leaveInclude,
    orderBy: [{ createdAt: 'desc' }],
    take: 500,
  });
}

function sequenceForRow(rows: LeaveRow[], rowId: string): number {
  const sorted = [...rows].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const index = sorted.findIndex((r) => r.id === rowId);
  return index >= 0 ? index + 1 : 1;
}

export async function getLeaveDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
): Promise<LeaveDeskSummary> {
  const today = startOfUtcDay(new Date());
  const weekStart = new Date(today);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);

  const [dbRows, residentsTotal, extensionPending, hostels] = await Promise.all([
    fetchLeaveRows(prisma, scopeHostelNames),
    prisma.allocationRecord.count({
      where: {
        status: 'ACTIVE',
        ...(scopeHostelNames?.length
          ? {
              bed: {
                room: {
                  floor: { block: { building: { hostel: { name: { in: scopeHostelNames } } } } },
                },
              },
            }
          : {}),
      },
    }),
    prisma.leaveExtension.count({
      where: {
        status: 'PENDING',
        leave: hostelScopeWhere(scopeHostelNames),
      },
    }),
    scopeHostelNames?.length
      ? Promise.resolve([...scopeHostelNames].sort())
      : prisma.hostel.findMany({ select: { name: true }, orderBy: { name: 'asc' } }).then((h) => h.map((x) => x.name)),
  ]);

  let pendingReview = 0;
  let onLeaveNow = 0;
  let returningToday = 0;
  let overstayed = 0;
  let approvedThisWeek = 0;
  const categories = new Set<LeaveUiCategory>();

  for (const row of dbRows) {
    const status = deriveLeaveUiStatus(row, today);
    categories.add(mapLeaveCategory(row.leaveType));

    if (status === 'Pending Review') pendingReview += 1;
    if (status === 'On Leave') onLeaveNow += 1;
    if (status === 'Overstayed') overstayed += 1;

    const returnDay = startOfUtcDay(row.expectedReturnDate);
    if (returnDay.getTime() === today.getTime() && (status === 'On Leave' || status === 'Approved')) {
      returningToday += 1;
    }

    if (
      row.status.toUpperCase() === 'APPROVED' &&
      row.reviewedAt &&
      row.reviewedAt >= weekStart
    ) {
      approvedThisWeek += 1;
    }
  }

  const onCampusPercent =
    residentsTotal > 0 ? Math.round((1 - onLeaveNow / residentsTotal) * 100) : 100;

  return {
    generatedAt: new Date().toISOString(),
    pendingReview,
    onLeaveNow,
    returningToday,
    extensionsPending: extensionPending,
    overstayed,
    approvedThisWeek,
    residentsTotal,
    onCampusPercent,
    facets: {
      hostels,
      categories: [...categories].sort(),
    },
  };
}

export async function listLeaveDeskApplications(
  prisma: PrismaClient,
  query: LeaveDeskListQuery,
  scopeHostelNames?: string[],
): Promise<{ applications: LeaveDeskRecord[]; pagination: ReturnType<typeof buildPaginationMeta> }> {
  const { page, limit } = normalizePagination(query.page ?? DEFAULT_PAGE, query.limit ?? DEFAULT_PAGE_LIMIT);
  const today = startOfUtcDay(new Date());

  const dbRows = await fetchLeaveRows(prisma, scopeHostelNames);
  const reviewerIds = [...new Set(dbRows.map((r) => r.reviewedBy).filter((id): id is string => Boolean(id)))];
  const reviewers = await loadReviewerNames(prisma, reviewerIds);

  let mapped = dbRows.map((row) => mapLeaveRow(row, sequenceForRow(dbRows, row.id), today));
  mapped = attachReviewers(mapped, dbRows, reviewers);

  mapped = mapped.filter((rec) => {
    if (query.hostel && rec.hostel !== query.hostel) return false;
    if (query.category && rec.category !== query.category) return false;
    if (query.status && rec.status !== query.status) return false;
    if (!matchesQuery(rec, query.q)) return false;
    return true;
  });

  const total = mapped.length;
  const start = (page - 1) * limit;
  const applications = mapped.slice(start, start + limit);

  return {
    applications,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

export async function getLeaveDeskApplicationById(
  prisma: PrismaClient,
  leaveId: string,
  scopeHostelNames?: string[],
): Promise<{ application: LeaveDeskRecord; timeline: LeaveTimelineEntry[] } | null> {
  const row = await prisma.leaveApplication.findUnique({
    where: { id: leaveId },
    include: leaveInclude,
  });
  if (!row) return null;
  if (scopeHostelNames?.length && !hostelNameInScope(row.hostel.name, scopeHostelNames)) {
    return null;
  }

  const allRows = await fetchLeaveRows(prisma, scopeHostelNames);
  const seq = sequenceForRow(allRows, row.id);
  const today = startOfUtcDay(new Date());

  const reviewers = await loadReviewerNames(
    prisma,
    row.reviewedBy ? [row.reviewedBy] : [],
  );

  let application = mapLeaveRow(row, seq, today);
  application = attachReviewers([application], [row], reviewers)[0]!;

  const timeline: LeaveTimelineEntry[] = [
    {
      id: `${row.id}-submitted`,
      leaveId: row.id,
      action: 'Submitted',
      actor: studentDisplayName(row),
      notes: 'FR-038 leave form complete.',
      at: row.createdAt.toISOString(),
    },
  ];

  if (row.reviewedAt && row.status.toUpperCase() === 'APPROVED') {
    timeline.push({
      id: `${row.id}-approved`,
      leaveId: row.id,
      action: 'Approved',
      actor: application.reviewedBy ?? 'Warden',
      notes: 'Bed allocation retained (FR-040).',
      at: row.reviewedAt.toISOString(),
    });
  }

  if (row.reviewedAt && row.status.toUpperCase() === 'REJECTED') {
    timeline.push({
      id: `${row.id}-rejected`,
      leaveId: row.id,
      action: 'Rejected',
      actor: application.reviewedBy ?? 'Warden',
      notes: row.reason.slice(0, 120),
      at: row.reviewedAt.toISOString(),
    });
  }

  for (const ext of row.extensions) {
    timeline.push({
      id: ext.id,
      leaveId: row.id,
      action: ext.status.toUpperCase() === 'PENDING' ? 'Extension requested' : 'Extension reviewed',
      actor: studentDisplayName(row),
      notes: `New return ${formatDateOnly(ext.newReturnDate)} (FR-041).`,
      at: row.createdAt.toISOString(),
    });
  }

  const pass = row.gatePasses[0];
  if (pass) {
    timeline.push({
      id: `${pass.id}-pass`,
      leaveId: row.id,
      action: 'Gate pass issued',
      actor: 'System',
      notes: pass.passToken,
      at: pass.validFrom.toISOString(),
    });
  }

  const movement = pass?.movementLogs[0];
  if (movement?.actualReturn) {
    timeline.push({
      id: `${pass!.id}-return`,
      leaveId: row.id,
      action: movement.isLateReturn ? 'Late return' : 'Returned',
      actor: 'Gate desk',
      notes: movement.isLateReturn ? 'FR-043 warden alert triggered.' : 'Resident scanned in.',
      at: movement.actualReturn.toISOString(),
    });
  }

  if (application.status === 'Overstayed') {
    timeline.push({
      id: `${row.id}-overstay`,
      leaveId: row.id,
      action: 'Overstayed',
      actor: 'System',
      notes: 'Expected return passed without gate check-in.',
      at: new Date(
        startOfUtcDay(row.expectedReturnDate).getTime() + 6 * 3_600_000,
      ).toISOString(),
    });
  }

  timeline.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return { application, timeline };
}
