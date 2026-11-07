import type { SessionUser } from '@nestora/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse } from '../../common/api-response.js';
import * as service from './audit.service.js';

export async function getAuditLogs(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = request.user as SessionUser;
  const q = request.query as { page?: string; limit?: string };
  const { logs, pagination } = await service.listAuditLogsForAdmin(
    request.server.prisma,
    actor,
    q.page,
    q.limit,
  );
  reply.send(paginatedSuccessResponse({ logs }, 'Audit logs loaded.', pagination));
}
