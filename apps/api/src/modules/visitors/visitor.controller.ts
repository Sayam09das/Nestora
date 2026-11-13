import {
  registerVisitorBodySchema,
  visitorDeskListQuerySchema,
  visitorIdParamsSchema,
  visitorRejectBodySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import {
  assertHostelFilterInScope,
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './visitor.service.js';

export async function getVisitorDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD');

  const hostel =
    typeof request.query === 'object' && request.query && 'hostel' in request.query
      ? String((request.query as { hostel?: string }).hostel ?? '')
      : undefined;

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (hostel?.trim() && hostel !== 'All Hostels') {
      assertHostelFilterInScope(hostel, scopeHostelNames);
    }
  }

  const summary = await service.getVisitorDeskSummary(request.server.prisma, scopeHostelNames, hostel);
  reply.send(successResponse({ summary }, 'Visitor desk summary loaded.'));
}

export async function listVisitorDeskRecordsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD');

  const query = visitorDeskListQuerySchema.parse(request.query);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    assertHostelFilterInScope(query.hostel, scopeHostelNames);
  }

  const records = await service.listVisitorDeskRecords(request.server.prisma, query, scopeHostelNames);
  reply.send(successResponse({ records }, 'Visitor records loaded.'));
}

export async function registerVisitorHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD');

  const body = registerVisitorBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.registerVisitor(
    request.server.prisma,
    body,
    user.id,
    scopeHostelNames,
  );
  reply.send(successResponse({ record }, 'Visitor registered.'));
}

export async function approveVisitorHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { visitorId } = visitorIdParamsSchema.parse(request.params);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.approveVisitor(
    request.server.prisma,
    visitorId,
    user.id,
    scopeHostelNames,
  );
  reply.send(successResponse({ record }, 'Visitor approved.'));
}

export async function rejectVisitorHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { visitorId } = visitorIdParamsSchema.parse(request.params);
  visitorRejectBodySchema.parse(request.body ?? {});

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.rejectVisitor(
    request.server.prisma,
    visitorId,
    user.id,
    scopeHostelNames,
  );
  reply.send(successResponse({ record }, 'Visitor rejected.'));
}

export async function checkInVisitorHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD');

  const { visitorId } = visitorIdParamsSchema.parse(request.params);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.checkInVisitor(request.server.prisma, visitorId, scopeHostelNames);
  reply.send(successResponse({ record }, 'Visitor checked in.'));
}

export async function checkOutVisitorHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD');

  const { visitorId } = visitorIdParamsSchema.parse(request.params);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.checkOutVisitor(request.server.prisma, visitorId, scopeHostelNames);
  reply.send(successResponse({ record }, 'Visitor checked out.'));
}
