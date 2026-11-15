import type { PrismaClient } from '@nestora/database';
import { CONFIG_KEYS, getConfigBoolean, getConfigNumber } from '../modules/settings/system-config.service.js';

export async function runLateFeeAssessments(prisma: PrismaClient): Promise<number> {
  const autoLate = await getConfigBoolean(prisma, CONFIG_KEYS.auto_late_enabled);
  if (!autoLate) return 0;

  const graceDays = await getConfigNumber(prisma, CONFIG_KEYS.late_fee_grace_days);
  const flatAmount = await getConfigNumber(prisma, CONFIG_KEYS.late_fee_flat_amount);
  const graceCutoff = new Date();
  graceCutoff.setUTCDate(graceCutoff.getUTCDate() - graceDays);

  const ledgers = await prisma.studentLedger.findMany({
    where: { currentBalance: { gt: 0 } },
    select: {
      id: true,
      studentId: true,
      student: {
        select: {
          paymentRecords: { orderBy: { paymentDate: 'desc' }, take: 1, select: { paymentDate: true } },
          feeAdjustments: {
            where: {
              adjustmentType: { contains: 'LATE', mode: 'insensitive' },
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
    take: 40,
  });

  const systemActor =
    (
      await prisma.user.findFirst({
        where: { role: 'ACCOUNTANT', status: 'ACTIVE' },
        select: { id: true },
      })
    )?.id ??
    (
      await prisma.user.findFirst({
        where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
        select: { id: true },
      })
    )?.id;
  if (!systemActor) return 0;

  let created = 0;
  for (const ledger of ledgers) {
    const lastPay = ledger.student.paymentRecords[0]?.paymentDate;
    if (lastPay && lastPay.getTime() > graceCutoff.getTime()) continue;
    if (ledger.student.feeAdjustments.length > 0) continue;

    await prisma.$transaction(async (tx) => {
      await tx.feeAdjustment.create({
        data: {
          studentId: ledger.studentId,
          adjustmentType: 'LATE_FEE',
          amount: flatAmount,
          reason: `Automatic late fee after ${graceDays}-day grace (MOD-14, FR-078).`,
          status: 'APPROVED',
          proposedBy: systemActor,
          approvedBy: systemActor,
          approvedAt: new Date(),
        },
      });
      await tx.studentLedger.update({
        where: { id: ledger.id },
        data: {
          totalAssessed: { increment: flatAmount },
          currentBalance: { increment: flatAmount },
          lastRecalculated: new Date(),
        },
      });
    });
    created += 1;
  }

  return created;
}