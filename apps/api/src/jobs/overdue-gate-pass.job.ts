import type { PrismaClient } from '@nestora/database';
import { notifyOverdueGateReturn } from '../modules/notifications/notification-events.service.js';

const DEDUPE_WINDOW_MS = 6 * 60 * 60 * 1000;
const AUTO_FLAG_REMARK = 'Auto-flagged: pass window elapsed without return (MOD-10).';

export async function runOverdueGatePassAlerts(prisma: PrismaClient): Promise<number> {
  const now = new Date();
  const dedupeSince = new Date(now.getTime() - DEDUPE_WINDOW_MS);

  const rows = await prisma.gateMovementLog.findMany({
    where: {
      actualDeparture: { not: null },
      actualReturn: null,
      pass: { validUntil: { lt: now } },
    },
    include: {
      pass: { select: { id: true, passToken: true, validUntil: true } },
      student: {
        select: {
          registrationNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      hostel: { select: { id: true, name: true } },
    },
    take: 100,
  });

  let created = 0;
  for (const row of rows) {
    if (!row.isLateReturn) {
      await prisma.gateMovementLog.update({
        where: { id: row.id },
        data: {
          isLateReturn: true,
          remarks: row.remarks?.trim() ? row.remarks : AUTO_FLAG_REMARK,
        },
      });
    }

    const studentName =
      `${row.student.user.firstName ?? ''} ${row.student.user.lastName ?? ''}`.trim() ||
      row.student.registrationNumber;
    const sent = await notifyOverdueGateReturn(prisma, {
      hostelId: row.hostel.id,
      passId: row.pass.id,
      passToken: row.pass.passToken,
      studentName,
      hostelName: row.hostel.name,
      validUntil: row.pass.validUntil.toISOString(),
      dedupeSince,
    });
    created += sent;
  }

  return created;
}