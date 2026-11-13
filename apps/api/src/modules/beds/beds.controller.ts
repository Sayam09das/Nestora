import { bedDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
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
import * as service from './beds.service.js';

export async function getBedDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getBedDirectorySummaryForHostels(
      request.server.prisma,
      hostelNames,
    );
    reply.send(successResponse({ summary }, 'Bed directory summary.'));
    return;
  }

  const summary = await service.getBedDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Bed directory summary.'));
}

export async function listBedDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = bedDirectoryListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (hostelNames.length === 0) {
      const page = query.page ?? DEFAULT_PAGE;
      const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
      const { page: safePage, limit: safeLimit } = normalizePagination(page, limit);
      reply.send(
        paginatedSuccessResponse(
          { beds: [] },
          'Bed directory loaded.',
          buildPaginationMeta(safePage, safeLimit, 0),
        ),
      );
      return;
    }
    assertHostelFilterInScope(query.hostel, hostelNames);

    const { beds, pagination } = await service.listBedDirectory(request.server.prisma, {
      ...query,
      scopeHostelNames: hostelNames,
    });
    reply.send(paginatedSuccessResponse({ beds }, 'Bed directory loaded.', pagination));
    return;
  }

  const { beds, pagination } = await service.listBedDirectory(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ beds }, 'Bed directory loaded.', pagination));
}

export async function getBedDirectoryByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const bedId = (request.params as { bedId: string }).bedId;

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const bed = await service.getBedDirectoryById(request.server.prisma, bedId, hostelNames);
    if (!bed) {
      throw new NotFoundError('Bed not found.');
    }
    reply.send(successResponse({ bed }, 'Bed details loaded.'));
    return;
  }

  const bed = await service.getBedDirectoryById(request.server.prisma, bedId);
  if (!bed) {
    throw new NotFoundError('Bed not found.');
  }
  reply.send(successResponse({ bed }, 'Bed details loaded.'));
}
