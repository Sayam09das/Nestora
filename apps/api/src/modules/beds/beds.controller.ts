import { bedDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './beds.service.js';

export async function getBedDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const summary = await service.getBedDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Bed directory summary.'));
}

export async function listBedDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = bedDirectoryListQuerySchema.parse(request.query);
  const { beds, pagination } = await service.listBedDirectory(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ beds }, 'Bed directory loaded.', pagination));
}
