import type { FastifyReply, FastifyRequest } from 'fastify';
import { staffReportIncidentBodySchema } from '@nestora/validators';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import { createStaffIncidentReport, getStaffReportDesk } from '../incidents/incidents.service.js';
import { resolveHostelScope } from './operational-dashboard.service.js';

export async function getStaffReportDeskHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const { hostelIds, hostelNames } = await resolveHostelScope(request.server.prisma, user.id, 'HOSTEL_STAFF');
  const desk = await getStaffReportDesk(request.server.prisma, user.id, hostelIds, hostelNames);
  reply.send(successResponse({ desk }, 'Staff report desk.'));
}

export async function postStaffReportHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const body = staffReportIncidentBodySchema.parse(request.body);
  const { hostelIds } = await resolveHostelScope(request.server.prisma, user.id, 'HOSTEL_STAFF');
  const record = await createStaffIncidentReport(request.server.prisma, user.id, hostelIds, body);
  reply.status(201).send(successResponse({ record }, 'Issue reported to the warden desk.'));
}