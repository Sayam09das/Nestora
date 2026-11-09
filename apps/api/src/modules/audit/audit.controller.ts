import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse } from '../../common/api-response.js';
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
