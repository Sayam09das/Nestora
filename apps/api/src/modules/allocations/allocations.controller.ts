import { allocationDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import {
  assertHostelFilterInScope,
  hostelNameInScope,
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './allocations.service.js';

export async function getAllocationDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getAllocationDirectorySummaryForHostels(
      request.server.prisma,
      hostelNames,
    );
    reply.send(successResponse({ summary }, 'Allocation directory summary.'));
    return;
  }

  const summary = await service.getAllocationDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Allocation directory summary.'));
}

export async function listAllocationDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = allocationDirectoryListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (hostelNames.length === 0) {
      const page = query.page ?? DEFAULT_PAGE;
      const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
      const { page: safePage, limit: safeLimit } = normalizePagination(page, limit);
      reply.send(
        paginatedSuccessResponse(
          { allocations: [] },
          'Allocation directory loaded.',
          buildPaginationMeta(safePage, safeLimit, 0),
        ),
      );
      return;
    }
    assertHostelFilterInScope(query.hostel, hostelNames);

    const { allocations, pagination } = await service.listAllocationDirectory(
      request.server.prisma,
      { ...query, scopeHostelNames: hostelNames },
    );
    reply.send(paginatedSuccessResponse({ allocations }, 'Allocation directory loaded.', pagination));
    return;
  }

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
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  let queue = await service.listAllocationQueue(request.server.prisma);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    queue = queue.filter((row) => {
      const hostel = row.hostel ?? row.preferenceHostel;
      return hostel ? hostelNameInScope(hostel, hostelNames) : false;
    });
  }

  reply.send(successResponse({ queue }, 'Allocation queue loaded.'));
}
