import type { Prisma, PrismaClient } from '@nestora/database';
import type { LeaveDeskListQuery } from '@nestora/validators';
import { createHash, randomBytes } from 'node:crypto';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
const PENDING_DB = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const APPROVED_DB = 'APPROVED';
const REJECTED_DB = 'REJECTED';
const RETURNED_DB = ['RETURNED', 'COMPLETED'] as const;

export type LeaveUiStatus =
  | 'Pending Review'
  | 'Approved'
  | 'On Leave'
  | 'Returned'
  | 'Rejected'
  | 'Extension Pending'
  | 'Overstayed';

export type LeaveUiCategory = 'Medical' | 'Family' | 'Academic' | 'Emergency' | 'Personal';

export type LeaveDeskRow = {
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
  onCampusPercent: number | null;
  facets: {
    hostels: string[];
    categories: string[];
  };
};

const bedPathInclude = {
  room: {
    include: {
      floor: {
        include: {
          block: { select: { name: true } },
        },
      },
    },
  },
} satisfies Prisma.BedInclude;

const leaveInclude = {
  hostel: { select: { name: true } },
  student: {
    include: {
      user: { select: { firstName: true, lastName: true } },
      allocationRecords: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: { bed: { include: bedPathInclude } },
      },
    },
  },
  gatePasses: { orderBy: { validFrom: 'desc' as const }, take: 1 },
  extensions: { orderBy: { id: 'desc' as const } },
} satisfies Prisma.LeaveApplicationInclude;

type LeaveRow = Prisma.LeaveApplicationGetPayload<{ include: typeof leaveInclude }>;

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function dateOnlyIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function mapCategory(leaveType: string): LeaveUiCategory {
  const t = leaveType.trim().toLowerCase();
  if (t.includes('medical') || t.includes('health')) return 'Medical';
  if (t.includes('family') || t.includes('wedding')) return 'Family';
  if (t.includes('academic') || t.includes('exam') || t.includes('intern')) return 'Academic';
  if (t.includes('emergency')) return 'Emergency';
  return 'Personal';
}

function leaveRefFromId(id: string, createdAt: Date): string {
  const year = createdAt.getUTCFullYear();
  const short = createHash('sha256').update(id).digest('hex').slice(0, 4).toUpperCase();
  return `LV-${year}-${short}`;
}

function roomBedLabel(alloc: LeaveRow['student']['allocationRecords'][0] | undefined): {
  block: string;
  roomBed: string;
} {
  if (!alloc?.bed) {
    return { block: '—', roomBed: 'Unallocated' };
  }
  const room = alloc.bed.room;
  const block = room.floor.block.name;
  return {
    block,
    roomBed: `${room.roomNumber} · Bed ${alloc.bed.bedNumber}`,
  };
}

function deriveUiStatus(row: LeaveRow, today: Date): LeaveUiStatus {
  const pendingExtension = row.extensions.some((e) => e.status.toUpperCase() === 'PENDING');
  if (pendingExtension) return 'Extension Pending';

  const db = row.status.toUpperCase();
  const dep = row.departureDate;
  const ret = row.expectedReturnDate;
  const depIso = dateOnlyIso(dep);
  const retIso = dateOnlyIso(ret);
  const todayIso = dateOnlyIso(today);

  if (PENDING_DB.some((s) => s === db)) return 'Pending Review';
  if (db === REJECTED_DB) return 'Rejected';
  if (RETURNED_DB.includes(db as (typeof RETURNED_DB)[number])) return 'Returned';

  if (db === APPROVED_DB) {
    if (todayIso > retIso) return 'Overstayed';
    if (todayIso >= depIso && todayIso <= retIso) return 'On Leave';
    return 'Approved';
  }

  return 'Pending Review';
}

function mapLeaveRow(
  row: LeaveRow,
  today: Date,
  reviewerNames?: Map<string, string>,
): LeaveDeskRow {
  const student = row.student;
  const placement = roomBedLabel(student.allocationRecords[0]);
  const uiStatus = deriveUiStatus(row, today);
  const gatePass = row.gatePasses[0];
  const reviewer =
    row.reviewedBy && reviewerNames?.get(row.reviewedBy)
      ? reviewerNames.get(row.reviewedBy)!
      : row.reviewedBy
        ? 'Warden'
        : null;

  return {
    id: row.id,
    leaveRef: leaveRefFromId(row.id, row.createdAt),
    studentId: student.registrationNumber,
    studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
    hostel: row.hostel.name,
    block: placement.block,
    roomBed: placement.roomBed,
    category: mapCategory(row.leaveType),
    destination: row.destination,
    reason: row.reason,
    emergencyContact: row.emergencyContact,
    departureDate: dateOnlyIso(row.departureDate),
    expectedReturnDate: dateOnlyIso(row.expectedReturnDate),
    status: uiStatus,
    submittedAt: row.createdAt.toISOString(),
    reviewedBy: reviewer,
    gatePassToken: gatePass?.passToken ?? null,
    bedRetained: uiStatus !== 'Rejected',
    hasExtension: row.extensions.length > 0,
    lateReturn: uiStatus === 'Overstayed',
  };
}

function hostelWhere(scopeHostelNames?: string[]): Prisma.LeaveApplicationWhereInput {
  if (!scopeHostelNames?.length) return {};
  if (scopeHostelNames.length === 1) {
    return { hostel: { name: { equals: scopeHostelNames[0], mode: 'insensitive' } } };
  }
  return { hostel: { name: { in: scopeHostelNames, mode: 'insensitive' } } };
}

function matchesQuery(row: LeaveDeskRow, q: string): boolean {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  return (
    row.leaveRef.toLowerCase().includes(term) ||
    row.studentName.toLowerCase().includes(term) ||
    row.studentId.toLowerCase().includes(term) ||
    row.destination.toLowerCase().includes(term)
  );
}

function matchesStatusFilter(row: LeaveDeskRow, statusFilter: string | undefined): boolean {
  if (!statusFilter || statusFilter === 'All Status') return true;
  return row.status === statusFilter;
}

function matchesCategoryFilter(row: LeaveDeskRow, categoryFilter: string | undefined): boolean {
  if (!categoryFilter || categoryFilter === 'All Categories') return true;
  return row.category === categoryFilter;
}

function matchesHostelFilter(row: LeaveDeskRow, hostelFilter: string | undefined): boolean {
  if (!hostelFilter || hostelFilter === 'All Hostels') return true;
  return row.hostel.toLowerCase() === hostelFilter.trim().toLowerCase();
}

async function loadReviewerNames(
  prisma: PrismaClient,
  rows: LeaveRow[],
): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.reviewedBy).filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, firstName: true, lastName: true },
  });
  return new Map(
    users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim() || 'Warden']),
  );
}

async function loadLeaves(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<LeaveDeskRow[]> {
  const rows = await prisma.leaveApplication.findMany({
    where: hostelWhere(scopeHostelNames),
    include: leaveInclude,
    orderBy: { createdAt: 'desc' },
  });
  const reviewerNames = await loadReviewerNames(prisma, rows);
  const today = todayUtc();
  return rows.map((r) => mapLeaveRow(r, today, reviewerNames));
}

export async function getLeaveDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
  hostelFilter?: string,
): Promise<LeaveDeskSummary> {
  const applications = await loadLeaves(prisma, scopeHostelNames);
  const scoped =
    hostelFilter && hostelFilter !== 'All Hostels'
      ? applications.filter((a) => hostelNameInScope(a.hostel, [hostelFilter]))
      : applications;

  const today = todayUtc();
  const todayIso = dateOnlyIso(today);
  const weekStart = new Date(today);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);

  let pendingReview = 0;
  let onLeaveNow = 0;
  let returningToday = 0;
  let extensionsPending = 0;
  let overstayed = 0;
  let approvedThisWeek = 0;

  for (const row of scoped) {
    switch (row.status) {
      case 'Pending Review':
        pendingReview += 1;
        break;
      case 'On Leave':
        onLeaveNow += 1;
        break;
      case 'Extension Pending':
        extensionsPending += 1;
        break;
      case 'Overstayed':
        overstayed += 1;
        break;
      default:
        break;
    }
    if (row.expectedReturnDate === todayIso && ['On Leave', 'Approved', 'Overstayed'].includes(row.status)) {
      returningToday += 1;
    }
    if (row.status === 'Approved' || row.status === 'On Leave') {
      const reviewed = new Date(row.submittedAt);
      if (reviewed >= weekStart) approvedThisWeek += 1;
    }
  }

  const hostels = new Set<string>();
  const categories = new Set<string>();
  for (const row of applications) {
    hostels.add(row.hostel);
    categories.add(row.category);
  }

  const activeResidents = await prisma.allocationRecord.count({
    where: {
      status: 'ACTIVE',
      ...(scopeHostelNames?.length
        ? {
            bed: {
              room: {
                floor: {
                  block: {
                    building: {
                      hostel: {
                        name:
                          scopeHostelNames.length === 1
                            ? { equals: scopeHostelNames[0], mode: 'insensitive' }
                            : { in: scopeHostelNames, mode: 'insensitive' },
                      },
                    },
                  },
                },
              },
            },
          }
        : {}),
    },
  });

  const onCampusPercent =
    activeResidents > 0
      ? Math.round(((activeResidents - onLeaveNow) / activeResidents) * 1000) / 10
      : null;

  return {
    generatedAt: new Date().toISOString(),
    pendingReview,
    onLeaveNow,
    returningToday,
    extensionsPending,
    overstayed,
    approvedThisWeek,
    onCampusPercent,
    facets: {
      hostels: [...hostels].sort(),
      categories: [...categories].sort(),
    },
  };
}

export async function listLeaveDeskApplications(
  prisma: PrismaClient,
  query: LeaveDeskListQuery,
  scopeHostelNames?: string[],
): Promise<LeaveDeskRow[]> {
  const rows = await loadLeaves(prisma, scopeHostelNames);
  return rows.filter(
    (row) =>
      matchesQuery(row, query.q ?? '') &&
      matchesHostelFilter(row, query.hostel) &&
      matchesCategoryFilter(row, query.category) &&
      matchesStatusFilter(row, query.status),
  );
}

export async function getLeaveDeskApplication(
  prisma: PrismaClient,
  leaveId: string,
  scopeHostelNames?: string[],
): Promise<{ application: LeaveDeskRow; timeline: Array<{ id: string; leaveId: string; action: string; actor: string; notes: string | null; at: string }> }> {
  const row = await prisma.leaveApplication.findUnique({
    where: { id: leaveId },
    include: leaveInclude,
  });
  if (!row) {
    throw new NotFoundError('Leave application not found.');
  }
  if (scopeHostelNames?.length && !hostelNameInScope(row.hostel.name, scopeHostelNames)) {
    throw new NotFoundError('Leave application not found.');
  }

  const reviewerNames = await loadReviewerNames(prisma, [row]);
  const application = mapLeaveRow(row, todayUtc(), reviewerNames);
  const timeline: Array<{
    id: string;
    leaveId: string;
    action: string;
    actor: string;
    notes: string | null;
    at: string;
  }> = [
    {
      id: `${row.id}:submitted`,
      leaveId: row.id,
      action: 'Submitted',
      actor: application.studentName,
      notes: row.reason.slice(0, 120),
      at: row.createdAt.toISOString(),
    },
  ];
  if (row.reviewedAt) {
    timeline.push({
      id: `${row.id}:reviewed`,
      leaveId: row.id,
      action: row.status.toUpperCase() === REJECTED_DB ? 'Rejected' : 'Approved',
      actor: application.reviewedBy ?? 'Warden',
      notes: null,
      at: row.reviewedAt.toISOString(),
    });
  }
  for (const ext of row.extensions) {
    timeline.push({
      id: ext.id,
      leaveId: row.id,
      action: ext.status.toUpperCase() === 'PENDING' ? 'Extension requested' : 'Extension reviewed',
      actor: application.studentName,
      notes: ext.reason.slice(0, 120),
      at: row.createdAt.toISOString(),
    });
  }

  return { application, timeline };
}

function gatePassToken(): string {
  return `GP-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function decideLeaveApplication(
  prisma: PrismaClient,
  params: {
    leaveId: string;
    decision: 'Approved' | 'Rejected';
    feedback?: string;
    reviewerId: string;
    scopeHostelNames?: string[];
  },
): Promise<LeaveDeskRow> {
  const row = await prisma.leaveApplication.findUnique({
    where: { id: params.leaveId },
    include: { hostel: { select: { name: true } } },
  });
  if (!row) {
    throw new NotFoundError('Leave application not found.');
  }
  if (params.scopeHostelNames?.length && !hostelNameInScope(row.hostel.name, params.scopeHostelNames)) {
    throw new ForbiddenError('Leave application is outside your hostel scope.');
  }

  const db = row.status.toUpperCase();
  if (!PENDING_DB.some((s) => s === db)) {
    throw new BadRequestError('Only pending applications can be reviewed.');
  }
  if (params.decision === 'Rejected' && !params.feedback?.trim()) {
    throw new BadRequestError('Rejection requires warden feedback.');
  }

  const newStatus = params.decision === 'Approved' ? APPROVED_DB : REJECTED_DB;
  await prisma.leaveApplication.update({
    where: { id: params.leaveId },
    data: {
      status: newStatus,
      reviewedBy: params.reviewerId,
      reviewedAt: new Date(),
    },
  });

  if (params.decision === 'Approved') {
    const validFrom = new Date(row.departureDate);
    validFrom.setUTCHours(0, 0, 0, 0);
    const validUntil = new Date(row.expectedReturnDate);
    validUntil.setUTCHours(23, 59, 59, 999);
    await prisma.gatePass.create({
      data: {
        passToken: gatePassToken(),
        studentId: row.studentId,
        leaveId: row.id,
        validFrom,
        validUntil,
      },
    });
  }

  void params.feedback;

  const refreshed = await prisma.leaveApplication.findUnique({
    where: { id: params.leaveId },
    include: leaveInclude,
  });
  if (!refreshed) {
    throw new NotFoundError('Leave application not found.');
  }
  const reviewerNames = await loadReviewerNames(prisma, [refreshed]);
  return mapLeaveRow(refreshed, todayUtc(), reviewerNames);
}
