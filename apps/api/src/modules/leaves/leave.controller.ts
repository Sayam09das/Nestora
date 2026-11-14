import {
  leaveDecisionBodySchema,
  leaveDeskListQuerySchema,
  leaveIdParamsSchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { assertHostelFilterInScope, isHostelOperationalRole, resolveOperationalHostelNames } from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './leave.service.js';

export async function getLeaveDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const hostel = typeof request.query === 'object' && request.query && 'hostel' in request.query
    ? String((request.query as { hostel?: string }).hostel ?? '')
    : undefined;

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (hostel?.trim() && hostel !== 'All Hostels') {
      assertHostelFilterInScope(hostel, scopeHostelNames);
    }
  }

  const summary = await service.getLeaveDeskSummary(
    request.server.prisma,
    scopeHostelNames,
    hostel,
  );
  reply.send(successResponse({ summary }, 'Leave desk summary loaded.'));
}

export async function listLeaveDeskApplicationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = leaveDeskListQuerySchema.parse(request.query);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    assertHostelFilterInScope(query.hostel, scopeHostelNames);
  }

  const applications = await service.listLeaveDeskApplications(
    request.server.prisma,
    query,
    scopeHostelNames,
  );
  reply.send(successResponse({ applications }, 'Leave applications loaded.'));
}

export async function getLeaveDeskApplicationHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { leaveId } = leaveIdParamsSchema.parse(request.params);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const result = await service.getLeaveDeskApplication(
    request.server.prisma,
    leaveId,
    scopeHostelNames,
  );
  reply.send(successResponse(result, 'Leave application loaded.'));
}

export async function patchLeaveDecisionHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { leaveId } = leaveIdParamsSchema.parse(request.params);
  const body = leaveDecisionBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const application = await service.decideLeaveApplication(request.server.prisma, {
    leaveId,
    decision: body.decision,
    feedback: body.feedback,
    reviewerId: user.id,
    scopeHostelNames,
  });

  reply.send(successResponse({ application }, 'Leave decision saved.'));
}
