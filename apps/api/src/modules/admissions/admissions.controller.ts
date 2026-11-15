import { admissionApplicationIdParamsSchema, admissionTierVerificationBodySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import { resolveOperationalHostelNames } from '../../common/helpers/warden-hostel-scope.js';
import * as service from './admissions.service.js';
import { successResponse } from '../../common/api-response.js';

export async function postAdmissionTier1Handler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const { applicationId } = admissionApplicationIdParamsSchema.parse(request.params);
  const body = admissionTierVerificationBodySchema.parse(request.body);
  const admission = await service.verifyAdmissionTier1(
    request.server.prisma,
    user.id,
    user.role,
    applicationId,
    body,
    request.ip,
  );
  reply.send(successResponse({ admission }, 'Tier-1 admission verification recorded.'));
}

export async function postAdmissionTier2Handler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');

  const { applicationId } = admissionApplicationIdParamsSchema.parse(request.params);
  const body = admissionTierVerificationBodySchema.parse(request.body);
  const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  const admission = await service.verifyAdmissionTier2(
    request.server.prisma,
    user.id,
    user.role,
    applicationId,
    body,
    hostelNames,
    request.ip,
  );
  reply.send(successResponse({ admission }, 'Tier-2 warden verification recorded.'));
}