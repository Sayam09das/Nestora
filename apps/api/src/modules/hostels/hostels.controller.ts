import { hostelDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './hostels.service.js';

export async function getHostelDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const summary = await service.getHostelDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Hostel directory summary.'));
}

export async function listHostelDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = hostelDirectoryListQuerySchema.parse(request.query);
  const { hostels, pagination } = await service.listHostelDirectory(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ hostels }, 'Hostel directory loaded.', pagination));
}
