import { outingDecisionBodySchema, outingDeskListQuerySchema, outingIdParamsSchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import {
  assertHostelFilterInScope,
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './outing.service.js';

export async function getOutingDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const summary = await service.getOutingDeskSummary(request.server.prisma, scopeHostelNames);
  reply.send(successResponse({ summary }, 'Outing desk summary loaded.'));
}

export async function listOutingDeskApplicationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = outingDeskListQuerySchema.parse(request.query);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    assertHostelFilterInScope(query.hostel, scopeHostelNames);
  }

  const applications = await service.listOutingDeskApplications(
    request.server.prisma,
    query,
    scopeHostelNames,
  );
  reply.send(successResponse({ applications }, 'Outing applications loaded.'));
}

export async function patchOutingDecisionHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN');

  const { outingId } = outingIdParamsSchema.parse(request.params);
  const body = outingDecisionBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (user.role === 'HOSTEL_WARDEN') {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const application = await service.decideOutingApplication(request.server.prisma, {
    outingId,
    decision: body.decision,
    feedback: body.feedback,
    reviewerId: user.id,
    scopeHostelNames,
  });
  reply.send(successResponse({ application }, 'Outing decision recorded.'));
}