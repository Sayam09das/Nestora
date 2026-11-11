import { roomDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import {
  assertHostelFilterInScope,
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './rooms.service.js';

export async function getRoomDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getRoomDirectorySummaryForHostels(
      request.server.prisma,
      hostelNames,
    );
    reply.send(successResponse({ summary }, 'Room directory summary.'));
    return;
  }

  const summary = await service.getRoomDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Room directory summary.'));
}

export async function listRoomDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = roomDirectoryListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (hostelNames.length === 0) {
      const page = query.page ?? DEFAULT_PAGE;
      const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
      const { page: safePage, limit: safeLimit } = normalizePagination(page, limit);
      reply.send(
        paginatedSuccessResponse(
          { rooms: [] },
          'Room directory loaded.',
          buildPaginationMeta(safePage, safeLimit, 0),
        ),
      );
      return;
    }
    assertHostelFilterInScope(query.hostel, hostelNames);

    const { rooms, pagination } = await service.listRoomDirectory(request.server.prisma, {
      ...query,
      scopeHostelNames: hostelNames,
    });
    reply.send(paginatedSuccessResponse({ rooms }, 'Room directory loaded.', pagination));
    return;
  }

  const { rooms, pagination } = await service.listRoomDirectory(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ rooms }, 'Room directory loaded.', pagination));
}
