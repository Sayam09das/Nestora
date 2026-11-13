import type { Prisma, PrismaClient } from '@nestora/database';

export type CreateAuditInput = {
  actorUserId: string | null;
  actorRole: string;
  actionName: string;
  entityType: string;
  entityId: string;
  previousState?: Prisma.InputJsonValue | null;
  newState?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
};

type AuditDb = Pick<PrismaClient, 'auditLog'>;

export function createAuditLog(db: AuditDb, input: CreateAuditInput) {
  return db.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      actionName: input.actionName,
      entityType: input.entityType,
      entityId: input.entityId,
      previousState: input.previousState ?? undefined,
      newState: input.newState ?? undefined,
      ipAddress: input.ipAddress ?? null,
    },
  });
}

export function listAuditLogs(
  prisma: PrismaClient,
  opts: { skip: number; take: number; where: Prisma.AuditLogWhereInput },
) {
  return prisma.$transaction([
    prisma.auditLog.findMany({
      where: opts.where,
      orderBy: { timestamp: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.auditLog.count({ where: opts.where }),
  ]);
}

export function findAuditLogById(prisma: PrismaClient, id: string) {
  return prisma.auditLog.findUnique({ where: { id } });
}
