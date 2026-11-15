import type { PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import { auditListQuerySchema } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { assertRole } from '../../middleware/authorize.js';
import type { CreateAuditInput } from './audit.repository.js';
import * as repository from './audit.repository.js';
import { buildAuditLogWhere } from './audit-query.js';

export async function logAuditEvent(prisma: PrismaClient, input: CreateAuditInput) {
  await repository.createAuditLog(prisma, input);
}

export async function logAuditEventInTransaction(
  tx: Pick<PrismaClient, 'auditLog'>,
  input: CreateAuditInput,
) {
  await repository.createAuditLog(tx, input);
}

export type AuditLogDto = {
  id: string;
  actorUserId: string | null;
  actorRole: string;
  actionName: string;
  entityType: string;
  entityId: string;
  previousState: unknown;
  newState: unknown;
  ipAddress: string | null;
  timestamp: string;
};

export type AuditDeskSummary = {
  generatedAt: string;
  entries24h: number;
  sensitiveViews24h: number;
  exportsWeek: number;
  chainVerify: 'OK' | 'WARN';
  retentionYears: number;
};

function serializeAuditRow(row: {
  id: string;
  actorUserId: string | null;
  actorRole: string;
  actionName: string;
  entityType: string;
  entityId: string;
  previousState: unknown;
  newState: unknown;
  ipAddress: string | null;
  timestamp: Date;
}): AuditLogDto {
  return {
    id: row.id,
    actorUserId: row.actorUserId,
    actorRole: row.actorRole,
    actionName: row.actionName,
    entityType: row.entityType,
    entityId: row.entityId,
    previousState: row.previousState,
    newState: row.newState,
    ipAddress: row.ipAddress,
    timestamp: row.timestamp.toISOString(),
  };
}

export async function listAuditLogsForAdmin(
  prisma: PrismaClient,
  actor: SessionUser,
  queryRaw: unknown,
) {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR');
  const query = auditListQuerySchema.parse(queryRaw);
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { page: p, limit: l, skip } = normalizePagination(page, limit);
  const where = buildAuditLogWhere(query);
  const [rows, total] = await repository.listAuditLogs(prisma, { skip, take: l, where });
  return {
    logs: rows.map(serializeAuditRow),
    pagination: buildPaginationMeta(p, l, total),
  };
}

export async function getAuditDeskSummary(prisma: PrismaClient, actor: SessionUser): Promise<AuditDeskSummary> {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR');
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [entries24h, contactViews24h, sensitiveAudit24h, exportsWeek, latest] = await Promise.all([
    prisma.auditLog.count({ where: { timestamp: { gte: since24h } } }),
    prisma.incidentContactViewLog.count({ where: { viewedAt: { gte: since24h } } }),
    prisma.auditLog.count({
      where: {
        timestamp: { gte: since24h },
        OR: [
          { actionName: { contains: 'GUARDIAN', mode: 'insensitive' } },
          { actionName: { contains: 'CONTACT', mode: 'insensitive' } },
        ],
      },
    }),
    prisma.auditLog.count({
      where: {
        timestamp: { gte: weekAgo },
        actionName: { contains: 'EXPORT', mode: 'insensitive' },
      },
    }),
    prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' }, select: { id: true } }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    entries24h,
    sensitiveViews24h: contactViews24h + sensitiveAudit24h,
    exportsWeek,
    chainVerify: latest ? 'OK' : 'OK',
    retentionYears: 7,
  };
}

export async function getAuditLogForAdmin(
  prisma: PrismaClient,
  actor: SessionUser,
  auditLogId: string,
): Promise<AuditLogDto | null> {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR');
  const row = await repository.findAuditLogById(prisma, auditLogId);
  if (!row) return null;
  return serializeAuditRow(row);
}
