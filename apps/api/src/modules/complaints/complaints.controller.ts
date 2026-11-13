import {
  assignComplaintTicketBodySchema,
  complaintTicketIdParamsSchema,
  complaintsDeskListQuerySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import {
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './complaints.service.js';

export async function getComplaintsDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getComplaintsDeskSummary(request.server.prisma, hostelNames);
    reply.send(successResponse({ summary }, 'Complaints desk summary loaded.'));
    return;
  }

  const summary = await service.getComplaintsDeskSummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Complaints desk summary loaded.'));
}

export async function listComplaintsDeskTicketsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = complaintsDeskListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const result = await service.listComplaintsDeskTickets(request.server.prisma, query, hostelNames);
    reply.send(paginatedSuccessResponse({ tickets: result.tickets }, 'Complaint tickets loaded.', result.pagination));
    return;
  }

  const result = await service.listComplaintsDeskTickets(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ tickets: result.tickets }, 'Complaint tickets loaded.', result.pagination));
}

export async function getComplaintDeskTicketHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { ticketId } = complaintTicketIdParamsSchema.parse(request.params);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const detail = await service.getComplaintDeskTicketById(request.server.prisma, ticketId, hostelNames);
    if (!detail) throw new NotFoundError('Complaint ticket not found.');
    reply.send(successResponse(detail, 'Complaint ticket loaded.'));
    return;
  }

  const detail = await service.getComplaintDeskTicketById(request.server.prisma, ticketId);
  if (!detail) throw new NotFoundError('Complaint ticket not found.');
  reply.send(successResponse(detail, 'Complaint ticket loaded.'));
}

export async function assignComplaintTicketHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { ticketId } = complaintTicketIdParamsSchema.parse(request.params);
  const body = assignComplaintTicketBodySchema.parse(request.body);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const ticket = await service.assignComplaintTicket(
      request.server.prisma,
      ticketId,
      body,
      user.id,
      hostelNames,
    );
    reply.send(successResponse({ ticket }, 'Ticket assigned.'));
    return;
  }

  const ticket = await service.assignComplaintTicket(
    request.server.prisma,
    ticketId,
    body,
    user.id,
  );
  reply.send(successResponse({ ticket }, 'Ticket assigned.'));
}
