import { allocationDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './allocations.service.js';

export async function getAllocationDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const summary = await service.getAllocationDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Allocation directory summary.'));
}

export async function listAllocationDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = allocationDirectoryListQuerySchema.parse(request.query);
  const { allocations, pagination } = await service.listAllocationDirectory(
    request.server.prisma,
    query,
  );
  reply.send(paginatedSuccessResponse({ allocations }, 'Allocation directory loaded.', pagination));
}

export async function listAllocationQueueHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const queue = await service.listAllocationQueue(request.server.prisma);
  reply.send(successResponse({ queue }, 'Allocation queue loaded.'));
}
