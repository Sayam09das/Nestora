/**
 * Idempotent finance desk seed: ledgers, payments, schedules, pending waivers for allocated residents.
 *
 *   pnpm neon:seed-finance
 */
import { prisma } from '@nestora/database';

function assessedForCapacity(capacity: number, hasAc: boolean): number {
  const base = capacity === 1 ? 58000 : capacity === 2 ? 48500 : 42000;
  return hasAc ? base + 8000 : base;
}

async function resolveAdminId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
    select: { id: true },
  });
  if (!admin) throw new Error('No active UNIVERSITY_ADMINISTRATOR user found.');
  return admin.id;
}

async function ensureSchedules(adminId: string): Promise<void> {
  const count = await prisma.feeSchedule.count();
  if (count >= 2) return;

  const configs = await prisma.roomConfiguration.findMany({ take: 3, select: { id: true } });
  if (!configs.length) return;

  for (const [i, config] of configs.entries()) {
    const existing = await prisma.feeSchedule.findFirst({ where: { configId: config.id } });
    if (existing) continue;
    const schedule = await prisma.feeSchedule.create({
      data: {
        academicSession: '2025–26',
        semester: 'Q2',
        configId: config.id,
        status: i === 0 ? 'ACTIVE' : 'PENDING_APPROVAL',
        createdBy: adminId,
        approvedBy: i === 0 ? adminId : null,
        items: {
          create: [
            { itemName: 'Room rent', amount: 38000 },
            { itemName: 'Mess & amenities', amount: 6500 },
          ],
        },
      },
    });
    void schedule;
  }
}

async function main(): Promise<void> {
  const adminId = await resolveAdminId();
  await ensureSchedules(adminId);

  const allocations = await prisma.allocationRecord.findMany({
    where: { status: 'ACTIVE' },
    include: {
      student: { select: { id: true, registrationNumber: true } },
      bed: {
        include: {
          room: { include: { config: { select: { capacity: true, hasAc: true } } } },
        },
      },
    },
  });

  let receiptSeq = await prisma.paymentRecord.count();

  for (const [index, alloc] of allocations.entries()) {
    const assessed = assessedForCapacity(
      alloc.bed.room.config.capacity,
      alloc.bed.room.config.hasAc,
    );
    const paidRatio = [1, 0.85, 0.74, 0.62, 1, 0.55][index % 6] ?? 0.8;
    const paid = Math.round(assessed * paidRatio);
    const waived = index % 11 === 0 ? 2000 : 0;
    const balance = Math.max(0, assessed - paid - waived);

    await prisma.studentLedger.upsert({
      where: { studentId: alloc.student.id },
      create: {
        studentId: alloc.student.id,
        totalAssessed: assessed,
        totalPaid: paid,
        totalWaived: waived,
        currentBalance: balance,
      },
      update: {
        totalAssessed: assessed,
        totalPaid: paid,
        totalWaived: waived,
        currentBalance: balance,
        lastRecalculated: new Date(),
      },
    });

    const existingPayments = await prisma.paymentRecord.count({ where: { studentId: alloc.student.id } });
    if (existingPayments === 0 && paid > 0) {
      receiptSeq += 1;
      const daysAgo = [3, 8, 18, 35, 52, 12][index % 6] ?? 14;
      const paymentDate = new Date();
      paymentDate.setUTCDate(paymentDate.getUTCDate() - daysAgo);
      await prisma.paymentRecord.create({
        data: {
          receiptNumber: `RCP-2026-${String(receiptSeq).padStart(5, '0')}`,
          studentId: alloc.student.id,
          amount: paid,
          paymentMode: index % 2 === 0 ? 'NEFT' : 'UPI',
          transactionReference: `${alloc.student.registrationNumber.replace(/\//g, '')}-${index}`,
          paymentDate,
          recordedBy: adminId,
        },
      });
    }
  }

  const pending = await prisma.feeAdjustment.count({
    where: { status: { in: ['PENDING_ADMIN_APPROVAL', 'PENDING'] } },
  });
  if (pending < 4) {
    const students = allocations.slice(0, 4).map((a) => a.student.id);
    for (const [i, studentId] of students.entries()) {
      const exists = await prisma.feeAdjustment.findFirst({
        where: { studentId, status: 'PENDING_ADMIN_APPROVAL' },
      });
      if (exists) continue;
      await prisma.feeAdjustment.create({
        data: {
          studentId,
          adjustmentType: 'WAIVER',
          amount: 2000 + i * 1500,
          reason: i % 2 === 0 ? 'Medical concession' : 'Sibling discount',
          status: 'PENDING_ADMIN_APPROVAL',
          proposedBy: adminId,
        },
      });
    }
  }

  console.log(`Finance desk seed complete (${allocations.length} resident ledgers).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
