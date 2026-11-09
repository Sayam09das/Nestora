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
    logs: rows,
    pagination: buildPaginationMeta(p, l, total),
  };
}
