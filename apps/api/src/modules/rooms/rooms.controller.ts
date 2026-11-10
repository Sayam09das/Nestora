import { roomDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './rooms.service.js';

export async function getRoomDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const summary = await service.getRoomDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Room directory summary.'));
}

export async function listRoomDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = roomDirectoryListQuerySchema.parse(request.query);
  const { rooms, pagination } = await service.listRoomDirectory(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ rooms }, 'Room directory loaded.', pagination));
}
