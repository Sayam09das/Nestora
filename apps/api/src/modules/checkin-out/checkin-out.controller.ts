import {
  accountantClearanceBodySchema,
  checkOutRequestIdParamsSchema,
  createCheckOutRequestBodySchema,
  finalizeCheckOutBodySchema,
  rejectCheckOutBodySchema,
  wardenCheckInBodySchema,
  wardenCheckOutListQuerySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import { resolveOperationalHostelNames } from '../../common/helpers/warden-hostel-scope.js';
import { successResponse } from '../../common/api-response.js';
import * as service from './checkin-out.service.js';

export async function getStudentCheckOutDeskHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');
  const desk = await service.getStudentCheckOutDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student checkout desk loaded.'));
}

export async function postStudentCheckOutRequestHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');
  const body = createCheckOutRequestBodySchema.parse(request.body);
  const desk = await service.createStudentCheckOutRequest(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Checkout request submitted.'));
}

export async function getAccountantCheckOutRequestsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'ACCOUNTANT', 'UNIVERSITY_ADMINISTRATOR');
  const query = wardenCheckOutListQuerySchema.parse(request.query);
  const list = await service.listWardenCheckOutRequests(request.server.prisma, null, query.status);
  reply.send(successResponse(list, 'Accountant checkout queue loaded.'));
}

export async function getWardenCheckOutRequestsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');
  const query = wardenCheckOutListQuerySchema.parse(request.query);
  const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  const list = await service.listWardenCheckOutRequests(
    request.server.prisma,
    hostelNames,
    query.status,
  );
  reply.send(successResponse(list, 'Warden checkout queue loaded.'));
}

export async function postWardenFinalizeCheckOutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');
  const { requestId } = checkOutRequestIdParamsSchema.parse(request.params);
  const body = finalizeCheckOutBodySchema.parse(request.body);
  const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  const row = await service.finalizeWardenCheckOut(
    request.server.prisma,
    user.id,
    requestId,
    body,
    hostelNames,
  );
  reply.send(successResponse({ request: row }, 'Checkout finalized and bed released.'));
}

export async function postWardenRejectCheckOutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');
  const { requestId } = checkOutRequestIdParamsSchema.parse(request.params);
  const body = rejectCheckOutBodySchema.parse(request.body);
  const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  await service.rejectWardenCheckOut(request.server.prisma, user.id, requestId, body.remarks, hostelNames);
  reply.send(successResponse({ requestId }, 'Checkout request rejected.'));
}

export async function postStudentCancelCheckOutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');
  const { requestId } = checkOutRequestIdParamsSchema.parse(request.params);
  const desk = await service.cancelStudentCheckOutRequest(request.server.prisma, user.id, requestId);
  reply.send(successResponse({ desk }, 'Checkout request cancelled.'));
}

export async function postAccountantCheckOutClearanceHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'ACCOUNTANT', 'UNIVERSITY_ADMINISTRATOR');
  const { requestId } = checkOutRequestIdParamsSchema.parse(request.params);
  const body = accountantClearanceBodySchema.parse(request.body);
  const row = await service.markAccountantCheckOutClearance(
    request.server.prisma,
    user.id,
    requestId,
    body,
  );
  reply.send(successResponse({ request: row }, 'Accountant clearance recorded.'));
}

export async function postWardenCheckInHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');
  const body = wardenCheckInBodySchema.parse(request.body);
  const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  const checkIn = await service.recordWardenCheckIn(
    request.server.prisma,
    user.id,
    body,
    hostelNames,
  );
  reply.send(successResponse({ checkIn }, 'Resident check-in recorded.'));
}