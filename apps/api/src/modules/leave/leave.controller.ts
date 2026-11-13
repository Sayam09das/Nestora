import { leaveApplicationIdParamsSchema, leaveDeskListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import {
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './leave.service.js';

export async function getLeaveDeskSummaryHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getLeaveDeskSummary(request.server.prisma, hostelNames);
    reply.send(successResponse({ summary }, 'Leave desk summary loaded.'));
    return;
  }

  const summary = await service.getLeaveDeskSummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Leave desk summary loaded.'));
}

export async function listLeaveDeskApplicationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = leaveDeskListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const result = await service.listLeaveDeskApplications(request.server.prisma, query, hostelNames);
    reply.send(
      paginatedSuccessResponse({ applications: result.applications }, 'Leave applications loaded.', result.pagination),
    );
    return;
  }

  const result = await service.listLeaveDeskApplications(request.server.prisma, query);
  reply.send(
    paginatedSuccessResponse({ applications: result.applications }, 'Leave applications loaded.', result.pagination),
  );
}

export async function getLeaveDeskApplicationHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { leaveId } = leaveApplicationIdParamsSchema.parse(request.params);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const detail = await service.getLeaveDeskApplicationById(request.server.prisma, leaveId, hostelNames);
    if (!detail) throw new NotFoundError('Leave application not found.');
    reply.send(successResponse(detail, 'Leave application loaded.'));
    return;
  }

  const detail = await service.getLeaveDeskApplicationById(request.server.prisma, leaveId);
  if (!detail) throw new NotFoundError('Leave application not found.');
  reply.send(successResponse(detail, 'Leave application loaded.'));
}
