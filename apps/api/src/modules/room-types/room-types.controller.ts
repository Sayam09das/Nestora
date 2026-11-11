import { roomTypeDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './room-types.service.js';

export async function getRoomTypeDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const summary = await service.getRoomTypeDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Room type directory summary.'));
}

export async function listRoomTypeDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = roomTypeDirectoryListQuerySchema.parse(request.query);
  const { roomTypes, pagination } = await service.listRoomTypeDirectory(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ roomTypes }, 'Room type directory loaded.', pagination));
}
