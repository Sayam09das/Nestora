import type { Prisma, PrismaClient } from '@nestora/database';
import type { FinanceDeskListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
export type FeeAccountStatus = 'Current' | 'Due soon' | 'Overdue' | 'Cleared';

export type FinanceDeskLedgerRow = {
  id: string;
  code: string;
  studentName: string;
  regNo: string;
  hostel: string;
  room: string;
  semester: string;
  assessed: number;
  paid: number;
  outstanding: number;
  status: FeeAccountStatus;
  lastPayment: string | null;
  frRef: string;
  sparkline: number[];
};

export type FinanceDeskSummary = {
  generatedAt: string;
  collectedMonth: number;
  collectedMonthLabel: string;
  outstandingTotal: number;
  pendingApprovals: number;
  activeSchedules: number;
  remindersQueued: number;
  facets: { hostels: string[] };
};

export type FinanceCollectionTrendPoint = {
  month: string;
  collected: number;
  outstanding: number;
};

export type FinanceLedgerLine = {
  label: string;
  type: 'Charge' | 'Payment' | 'Waiver' | 'Late fee';
  amount: number;
  date: string;
  ref?: string;
};

export type FinancePendingWaiver = {
  id: string;
  student: string;
  amount: number;
  reason: string;
  status: string;
  frRef: string;
};

const PENDING_ADJUSTMENT_STATUSES = ['PENDING', 'PENDING_ADMIN_APPROVAL', 'SUBMITTED'] as const;
const SCHEDULE_ACTIVE_STATUSES = ['ACTIVE', 'APPROVED'] as const;
const SCHEDULE_PENDING_STATUSES = ['DRAFT', 'PENDING', 'PENDING_APPROVAL'] as const;

const residentInclude = {
  student: {
    include: {
      user: { select: { firstName: true, lastName: true } },
      studentLedger: true,
      paymentRecords: { orderBy: { paymentDate: 'desc' as const }, take: 12 },
      feeAdjustments: { where: { status: { in: [...PENDING_ADJUSTMENT_STATUSES] } }, take: 3 },
    },
  },
  bed: {
    include: {
      room: {
        include: {
          config: { select: { capacity: true, hasAc: true } },
          floor: {
            include: {
              block: {
                include: {
                  building: { include: { hostel: { select: { name: true } } } },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.AllocationRecordInclude;

type ResidentAlloc = Prisma.AllocationRecordGetPayload<{ include: typeof residentInclude }>;

function money(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return Math.round(Number(value));
}

function studentName(student: ResidentAlloc['student']): string {
  const first = student.user.firstName?.trim() ?? '';
  const last = student.user.lastName?.trim() ?? '';
  return `${first} ${last}`.trim() || 'Resident';
}

function deriveStatus(outstanding: number, lastPaymentIso: string | null): FeeAccountStatus {
  if (outstanding <= 0) return 'Cleared';
  const lastMs = lastPaymentIso ? new Date(lastPaymentIso).getTime() : 0;
  const daysSince = lastPaymentIso ? (Date.now() - lastMs) / (1000 * 60 * 60 * 24) : 999;
  if (daysSince > 45) return 'Overdue';
  if (daysSince > 21) return 'Due soon';
  return 'Current';
}

function frRefForStatus(status: FeeAccountStatus): string {
  switch (status) {
    case 'Overdue':
      return 'FR-078';
    case 'Due soon':
      return 'FR-081';
    case 'Cleared':
      return 'FR-083';
    default:
      return 'FR-077';
  }
}

function buildSparkline(payments: { paymentDate: Date; amount: Prisma.Decimal }[]): number[] {
  const buckets = Array.from({ length: 7 }, () => 0);
  const now = new Date();
  for (const p of payments) {
    const diffDays = Math.floor((now.getTime() - p.paymentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      const idx = 6 - diffDays;
      buckets[idx] = (buckets[idx] ?? 0) + money(p.amount);
    }
  }
  const max = Math.max(...buckets, 1);
  return buckets.map((v) => Math.max(1, Math.round((v / max) * 12)));
}

function ledgerCode(ledgerId: string): string {
  return `FEE-${ledgerId.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

function mapRow(alloc: ResidentAlloc, semesterLabel: string): FinanceDeskLedgerRow | null {
  const ledger = alloc.student.studentLedger;
  if (!ledger) return null;

  const hostel = alloc.bed.room.floor.block.building.hostel.name;
  const room = alloc.bed.room.roomNumber;
  const assessed = money(ledger.totalAssessed);
  const paid = money(ledger.totalPaid);
  const outstanding = money(ledger.currentBalance);
  const last = alloc.student.paymentRecords[0];
  const lastPayment = last ? last.paymentDate.toISOString() : null;
  const status = deriveStatus(outstanding, lastPayment);

  return {
    id: ledger.id,
    code: ledgerCode(ledger.id),
    studentName: studentName(alloc.student),
    regNo: alloc.student.registrationNumber,
    hostel,
    room,
    semester: semesterLabel,
    assessed,
    paid,
    outstanding,
    status,
    lastPayment,
    frRef: frRefForStatus(status),
    sparkline: buildSparkline(alloc.student.paymentRecords),
  };
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

async function resolveSemesterLabel(prisma: PrismaClient): Promise<string> {
  const schedule = await prisma.feeSchedule.findFirst({
    where: { status: { in: [...SCHEDULE_ACTIVE_STATUSES] } },
    orderBy: { createdAt: 'desc' },
    select: { academicSession: true, semester: true },
  });
  if (!schedule) return 'Current session';
  return `${schedule.academicSession} ${schedule.semester}`;
}

async function loadResidents(prisma: PrismaClient): Promise<ResidentAlloc[]> {
  return prisma.allocationRecord.findMany({
    where: { status: 'ACTIVE' },
    include: residentInclude,
    orderBy: { allocatedAt: 'desc' },
  });
}

function filterResidents(
  rows: ResidentAlloc[],
  scopeHostelNames?: string[],
): ResidentAlloc[] {
  if (!scopeHostelNames?.length) return rows;
  return rows.filter((r) =>
    hostelNameInScope(r.bed.room.floor.block.building.hostel.name, scopeHostelNames),
  );
}

function matchesQuery(row: FinanceDeskLedgerRow, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    row.studentName.toLowerCase().includes(needle) ||
    row.regNo.toLowerCase().includes(needle) ||
    row.code.toLowerCase().includes(needle) ||
    row.room.toLowerCase().includes(needle)
  );
}

export async function getFinanceDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
): Promise<FinanceDeskSummary> {
  const now = new Date();
  const monthStart = startOfUtcMonth(now);
  const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(now);

  const residents = filterResidents(await loadResidents(prisma), scopeHostelNames);
  const studentIds = residents.map((r) => r.studentId);

  const [
    collectedAgg,
    pendingAdjustments,
    pendingSchedules,
    activeSchedules,
  ] = await Promise.all([
    prisma.paymentRecord.aggregate({
      where: {
        paymentDate: { gte: monthStart },
        ...(studentIds.length ? { studentId: { in: studentIds } } : { studentId: { in: [] } }),
      },
      _sum: { amount: true },
    }),
    prisma.feeAdjustment.count({
      where: {
        status: { in: [...PENDING_ADJUSTMENT_STATUSES] },
        ...(studentIds.length ? { studentId: { in: studentIds } } : { studentId: { in: [] } }),
      },
    }),
    prisma.feeSchedule.count({ where: { status: { in: [...SCHEDULE_PENDING_STATUSES] } } }),
    prisma.feeSchedule.count({ where: { status: { in: [...SCHEDULE_ACTIVE_STATUSES] } } }),
  ]);

  const semesterLabel = await resolveSemesterLabel(prisma);
  const ledgerRows = residents
    .map((r) => mapRow(r, semesterLabel))
    .filter((r): r is FinanceDeskLedgerRow => r != null);

  const outstandingTotal = ledgerRows.reduce((s, r) => s + r.outstanding, 0);
  const remindersQueued = ledgerRows.filter(
    (r) => r.outstanding > 0 && (r.status === 'Due soon' || r.status === 'Overdue'),
  ).length;

  const hostels = [...new Set(ledgerRows.map((r) => r.hostel))].sort();

  return {
    generatedAt: new Date().toISOString(),
    collectedMonth: money(collectedAgg._sum.amount),
    collectedMonthLabel: monthLabel,
    outstandingTotal,
    pendingApprovals: pendingAdjustments + pendingSchedules,
    activeSchedules,
    remindersQueued,
    facets: { hostels },
  };
}

export async function listFinanceDeskLedgers(
  prisma: PrismaClient,
  query: FinanceDeskListQuery,
  scopeHostelNames?: string[],
): Promise<{
  ledgers: FinanceDeskLedgerRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
  collectionTrend: FinanceCollectionTrendPoint[];
}> {
  const pagination = normalizePagination(query.page ?? DEFAULT_PAGE, query.limit ?? DEFAULT_PAGE_LIMIT);
  const semesterLabel = await resolveSemesterLabel(prisma);
  const residents = filterResidents(await loadResidents(prisma), scopeHostelNames);

  let rows = residents
    .map((r) => mapRow(r, semesterLabel))
    .filter((r): r is FinanceDeskLedgerRow => r != null);

  if (query.hostel && query.hostel !== 'All hostels') {
    rows = rows.filter((r) => r.hostel === query.hostel);
  }
  if (query.status) {
    rows = rows.filter((r) => r.status === query.status);
  }
  if (query.q?.trim()) {
    rows = rows.filter((r) => matchesQuery(r, query.q!.trim()));
  }

  const total = rows.length;
  const start = (pagination.page - 1) * pagination.limit;
  const ledgers = rows.slice(start, start + pagination.limit);
  const collectionTrend = await buildCollectionTrend(prisma, scopeHostelNames);

  return {
    ledgers,
    pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
    collectionTrend,
  };
}

async function buildCollectionTrend(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
): Promise<FinanceCollectionTrendPoint[]> {
  const residents = filterResidents(await loadResidents(prisma), scopeHostelNames);
  const studentIds = residents.map((r) => r.studentId);
  const now = new Date();
  const points: FinanceCollectionTrendPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
    const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(d);
    const agg = await prisma.paymentRecord.aggregate({
      where: {
        paymentDate: { gte: d, lte: end },
        ...(studentIds.length ? { studentId: { in: studentIds } } : { studentId: { in: [] } }),
      },
      _sum: { amount: true },
    });
    const outstandingSnap =
      i === 0
        ? residents.reduce((s, r) => s + money(r.student.studentLedger?.currentBalance), 0)
        : Math.max(0, Math.round(money(agg._sum.amount) * 0.35));
    points.push({
      month: monthLabel,
      collected: money(agg._sum.amount),
      outstanding: outstandingSnap,
    });
  }
  return points;
}

export async function getFinanceLedgerDetail(
  prisma: PrismaClient,
  ledgerId: string,
  scopeHostelNames?: string[],
): Promise<{
  account: FinanceDeskLedgerRow;
  lines: FinanceLedgerLine[];
  pendingWaivers: FinancePendingWaiver[];
} | null> {
  const ledger = await prisma.studentLedger.findUnique({
    where: { id: ledgerId },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          paymentRecords: { orderBy: { paymentDate: 'desc' }, take: 24 },
          feeAdjustments: { orderBy: { createdAt: 'desc' }, take: 12 },
        },
      },
    },
  });

  if (!ledger) return null;

  const alloc = await prisma.allocationRecord.findFirst({
    where: { studentId: ledger.studentId, status: 'ACTIVE' },
    include: residentInclude,
  });
  if (!alloc) return null;

  const hostel = alloc.bed.room.floor.block.building.hostel.name;
  if (scopeHostelNames?.length && !hostelNameInScope(hostel, scopeHostelNames)) {
    return null;
  }

  const semesterLabel = await resolveSemesterLabel(prisma);
  const last = ledger.student.paymentRecords[0];
  const lastPayment = last ? last.paymentDate.toISOString() : null;
  const outstanding = money(ledger.currentBalance);
  const status = deriveStatus(outstanding, lastPayment);
  const account: FinanceDeskLedgerRow = {
    id: ledger.id,
    code: ledgerCode(ledger.id),
    studentName: studentName(alloc.student),
    regNo: ledger.student.registrationNumber,
    hostel,
    room: alloc.bed.room.roomNumber,
    semester: semesterLabel,
    assessed: money(ledger.totalAssessed),
    paid: money(ledger.totalPaid),
    outstanding,
    status,
    lastPayment,
    frRef: frRefForStatus(status),
    sparkline: buildSparkline(ledger.student.paymentRecords),
  };

  const lines: FinanceLedgerLine[] = [];
  const chargeDate = ledger.lastRecalculated.toISOString().slice(0, 10);
  if (money(ledger.totalAssessed) > 0) {
    lines.push({
      label: `${semesterLabel} hostel assessment`,
      type: 'Charge',
      amount: money(ledger.totalAssessed),
      date: chargeDate,
    });
  }

  for (const adj of ledger.student.feeAdjustments) {
    const type =
      adj.adjustmentType.toLowerCase().includes('late') ? 'Late fee' : adj.adjustmentType.toLowerCase().includes('waiver') ? 'Waiver' : 'Charge';
    lines.push({
      label: adj.reason,
      type,
      amount: money(adj.amount),
      date: adj.createdAt.toISOString().slice(0, 10),
      ref: 'FR-080',
    });
  }

  for (const pay of ledger.student.paymentRecords) {
    lines.push({
      label: `${pay.paymentMode} · ${pay.transactionReference}`,
      type: 'Payment',
      amount: -money(pay.amount),
      date: pay.paymentDate.toISOString().slice(0, 10),
      ref: 'FR-076',
    });
  }

  const pendingWaivers: FinancePendingWaiver[] = ledger.student.feeAdjustments
    .filter((a) =>
      PENDING_ADJUSTMENT_STATUSES.includes(a.status as (typeof PENDING_ADJUSTMENT_STATUSES)[number]),
    )
    .map((a) => ({
      id: a.id,
      student: studentName(alloc.student),
      amount: money(a.amount),
      reason: a.reason,
      status: 'Pending',
      frRef: 'FR-080',
    }));

  return { account, lines, pendingWaivers };
}
