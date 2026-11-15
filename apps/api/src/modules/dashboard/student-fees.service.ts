import type { PrismaClient } from '@nestora/database';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentFeeAccountStatus = 'cleared' | 'current' | 'due' | 'no_ledger';

export type StudentFeePayment = {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMode: string;
  paymentModeLabel: string;
  transactionReference: string;
  paymentDate: string;
  recordedAt: string;
};

export type StudentFeeLineItem = {
  id: string;
  itemName: string;
  amount: number;
};

export type StudentFeeAdjustmentRow = {
  id: string;
  adjustmentType: string;
  adjustmentTypeLabel: string;
  amount: number;
  reason: string;
  status: string;
  statusLabel: string;
  createdAt: string;
};

export type StudentFeesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  registrationNumber: string | null;
  summary: {
    totalAssessed: number;
    totalPaid: number;
    totalWaived: number;
    outstanding: number;
    dueDateLabel: string;
    accountStatus: StudentFeeAccountStatus;
    accountStatusLabel: string;
    paidPercent: number;
    lastRecalculated: string | null;
  };
  schedule: {
    id: string;
    title: string;
    semester: string;
    academicSession: string;
    items: StudentFeeLineItem[];
    itemsTotal: number;
  } | null;
  payments: StudentFeePayment[];
  adjustments: StudentFeeAdjustmentRow[];
  payOnlineAvailable: boolean;
  payOnlineNote: string;
};

function formatPaymentMode(mode: string): string {
  return mode
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDisplayDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function mapAdjustmentStatus(status: string): { statusLabel: string } {
  const upper = status.toUpperCase();
  if (upper.includes('APPROVED')) return { statusLabel: 'Approved' };
  if (upper.includes('REJECT') || upper.includes('DENIED')) return { statusLabel: 'Declined' };
  return { statusLabel: 'Pending approval' };
}

function mapAccountStatus(
  outstanding: number,
  totalAssessed: number,
  hasLedger: boolean,
): { accountStatus: StudentFeeAccountStatus; accountStatusLabel: string } {
  if (!hasLedger && totalAssessed === 0 && outstanding === 0) {
    return { accountStatus: 'no_ledger', accountStatusLabel: 'No fee record yet' };
  }
  if (outstanding <= 0) {
    return { accountStatus: 'cleared', accountStatusLabel: 'Account cleared' };
  }
  if (totalAssessed > 0 && outstanding < totalAssessed) {
    return { accountStatus: 'current', accountStatusLabel: 'Partially paid' };
  }
  return { accountStatus: 'due', accountStatusLabel: 'Payment due' };
}

function dueDateLabel(outstanding: number): string {
  if (outstanding <= 0) return '—';
  return 'As per hostel / accounts notice';
}

const emptyDesk = (now: Date): StudentFeesDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  hostelName: null,
  registrationNumber: null,
  summary: {
    totalAssessed: 0,
    totalPaid: 0,
    totalWaived: 0,
    outstanding: 0,
    dueDateLabel: '—',
    accountStatus: 'no_ledger',
    accountStatusLabel: 'No fee record yet',
    paidPercent: 0,
    lastRecalculated: null,
  },
  schedule: null,
  payments: [],
  adjustments: [],
  payOnlineAvailable: false,
  payOnlineNote: 'Pay at the hostel accounts office or as directed in your fee notice.',
});

export async function getStudentFeesDesk(prisma: PrismaClient, userId: string): Promise<StudentFeesDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      registrationNumber: true,
      academicYear: true,
      currentSemester: true,
    },
  });

  if (!student) {
    return emptyDesk(now);
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: { include: { building: { include: { hostel: { select: { name: true } } } } } },
                },
              },
            },
          },
        },
      },
    },
  });

  const hostelName = allocation?.bed.room.floor.block.building.hostel.name ?? null;
  const configId = allocation?.bed.room.configId ?? null;

  const [ledger, paymentRows, adjustmentRows, feeSchedule] = await Promise.all([
    prisma.studentLedger.findUnique({
      where: { studentId: student.id },
    }),
    prisma.paymentRecord.findMany({
      where: { studentId: student.id },
      orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
      take: 40,
      select: {
        id: true,
        receiptNumber: true,
        amount: true,
        paymentMode: true,
        transactionReference: true,
        paymentDate: true,
        createdAt: true,
      },
    }),
    prisma.feeAdjustment.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        adjustmentType: true,
        amount: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    }),
    configId
      ? prisma.feeSchedule.findFirst({
          where: { configId },
          include: { items: { orderBy: { itemName: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve(null),
  ]);

  const totalAssessed = ledger ? Number(ledger.totalAssessed) : 0;
  const totalPaid = ledger ? Number(ledger.totalPaid) : 0;
  const totalWaived = ledger ? Number(ledger.totalWaived) : 0;
  const outstanding = ledger ? Number(ledger.currentBalance) : 0;
  const paidPercent =
    totalAssessed > 0 ? Math.min(100, Math.round((totalPaid / totalAssessed) * 1000) / 10) : totalPaid > 0 ? 100 : 0;

  const { accountStatus, accountStatusLabel } = mapAccountStatus(outstanding, totalAssessed, Boolean(ledger));

  const payments: StudentFeePayment[] = paymentRows.map((row) => ({
    id: row.id,
    receiptNumber: row.receiptNumber,
    amount: Number(row.amount),
    paymentMode: row.paymentMode,
    paymentModeLabel: formatPaymentMode(row.paymentMode),
    transactionReference: row.transactionReference,
    paymentDate: formatShortDate(row.paymentDate),
    recordedAt: formatDisplayDateTime(row.createdAt),
  }));

  const adjustments: StudentFeeAdjustmentRow[] = adjustmentRows.map((row) => {
    const mapped = mapAdjustmentStatus(row.status);
    return {
      id: row.id,
      adjustmentType: row.adjustmentType,
      adjustmentTypeLabel: formatPaymentMode(row.adjustmentType),
      amount: Number(row.amount),
      reason: row.reason,
      status: row.status,
      statusLabel: mapped.statusLabel,
      createdAt: formatDisplayDateTime(row.createdAt),
    };
  });

  let schedule: StudentFeesDesk['schedule'] = null;
  if (feeSchedule?.items.length) {
    const items: StudentFeeLineItem[] = feeSchedule.items.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      amount: Number(item.amount),
    }));
    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    schedule = {
      id: feeSchedule.id,
      title: `${feeSchedule.academicSession} · ${feeSchedule.semester}`,
      semester: feeSchedule.semester,
      academicSession: feeSchedule.academicSession,
      items,
      itemsTotal,
    };
  }

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    hostelName,
    registrationNumber: student.registrationNumber,
    summary: {
      totalAssessed,
      totalPaid,
      totalWaived,
      outstanding,
      dueDateLabel: dueDateLabel(outstanding),
      accountStatus,
      accountStatusLabel,
      paidPercent,
      lastRecalculated: ledger ? ledger.lastRecalculated.toISOString() : null,
    },
    schedule,
    payments,
    adjustments,
    payOnlineAvailable: false,
    payOnlineNote: 'Online payment is not enabled for your hostel yet. Visit the accounts office with your registration number.',
  };
}