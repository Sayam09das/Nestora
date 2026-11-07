import type { Prisma } from '@nestora/database';
import type { AuditListQuery } from '@nestora/validators';

export function buildAuditLogWhere(query: AuditListQuery): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};

  if (query.actorUserId) {
    where.actorUserId = query.actorUserId;
  }
  if (query.actionName) {
    where.actionName = query.actionName;
  }
  if (query.entityType) {
    where.entityType = query.entityType;
  }
  if (query.entityId) {
    where.entityId = query.entityId;
  }
  if (query.from || query.to) {
    where.timestamp = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  return where;
}
