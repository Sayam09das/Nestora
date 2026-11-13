import { auditLogIdParamsSchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import * as service from './audit.service.js';

export async function getAuditLogs(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = requireAuth(request);
  const { logs, pagination } = await service.listAuditLogsForAdmin(
    request.server.prisma,
    actor,
    request.query,
  );
  reply.send(paginatedSuccessResponse({ logs }, 'Audit logs loaded.', pagination));
}

export async function getAuditDeskSummaryHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = requireAuth(request);
  const summary = await service.getAuditDeskSummary(request.server.prisma, actor);
  reply.send(successResponse({ summary }, 'Audit desk summary loaded.'));
}

export async function getAuditLogByIdHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = requireAuth(request);
  const { auditLogId } = auditLogIdParamsSchema.parse(request.params);
  const log = await service.getAuditLogForAdmin(request.server.prisma, actor, auditLogId);
  if (!log) throw new NotFoundError('Audit log entry not found.');
  reply.send(successResponse({ log }, 'Audit log loaded.'));
}
