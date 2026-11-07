import type { PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { assertRole } from '../../middleware/authorize.js';
import type { CreateAuditInput } from './audit.repository.js';
import * as repository from './audit.repository.js';

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
  pageRaw: unknown,
  limitRaw: unknown,
) {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR');
  const page = typeof pageRaw === 'string' ? Number(pageRaw) : Number(pageRaw ?? 1);
  const limit = typeof limitRaw === 'string' ? Number(limitRaw) : Number(limitRaw ?? 20);
  const { page: p, limit: l, skip } = normalizePagination(page, limit);
  const [rows, total] = await repository.listAuditLogs(prisma, { skip, take: l });
  return {
    logs: rows,
    pagination: buildPaginationMeta(p, l, total),
  };
}
