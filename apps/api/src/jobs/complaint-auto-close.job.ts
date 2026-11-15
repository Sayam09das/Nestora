import type { PrismaClient } from '@nestora/database';
import { CONFIG_KEYS, getConfigNumber } from '../modules/settings/system-config.service.js';

export async function runComplaintAutoClose(prisma: PrismaClient): Promise<number> {
  const hours = await getConfigNumber(prisma, CONFIG_KEYS.auto_close_hours);
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const stale = await prisma.complaintTicket.findMany({
    where: {
      status: 'RESOLVED',
      updatedAt: { lt: cutoff },
    },
    select: { id: true, assignments: { orderBy: { assignedAt: 'desc' }, take: 1, select: { assignedBy: true } } },
    take: 50,
  });

  let closed = 0;
  for (const ticket of stale) {
    const actorId =
      ticket.assignments[0]?.assignedBy ??
      (
        await prisma.user.findFirst({
          where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
          select: { id: true },
        })
      )?.id;
    if (!actorId) continue;

    await prisma.$transaction(async (tx) => {
      await tx.complaintTicket.update({
        where: { id: ticket.id },
        data: { status: 'CLOSED' },
      });
      await tx.ticketStatusHistory.create({
        data: {
          ticketId: ticket.id,
          status: 'CLOSED',
          changedBy: actorId,
          notes: 'Auto-closed after resolved window (MOD-12, FR-072).',
        },
      });
    });
    closed += 1;
  }
  return closed;
}