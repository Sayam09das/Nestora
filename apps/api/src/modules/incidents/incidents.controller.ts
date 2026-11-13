import {
  incidentActionBodySchema,
  incidentIdParamsSchema,
  incidentsDeskListQuerySchema,
  patchIncidentSeverityBodySchema,
  resolveIncidentBodySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { buildPaginationMeta } from '../../common/helpers/pagination.js';
import {
  assertHostelFilterInScope,
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './incidents.service.js';

const deskRoles = ['UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD'] as const;
const wardenRoles = ['UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN'] as const;

export async function getIncidentsDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...deskRoles);

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

  const summary = await service.getIncidentsDeskSummary(
    request.server.prisma,
    scopeHostelNames,
    hostel,
  );
  reply.send(successResponse({ summary }, 'Incidents desk summary loaded.'));
}

export async function listIncidentsDeskRecordsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...deskRoles);

  const query = incidentsDeskListQuerySchema.parse(request.query);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    assertHostelFilterInScope(query.hostel, scopeHostelNames);
  }

  const { records, total } = await service.listIncidentsDeskRecords(
    request.server.prisma,
    query,
    scopeHostelNames,
  );
  const page = query.page ?? 1;
  const limit = query.limit ?? 120;
  reply.send(
    successResponse(
      { records },
      'Incident records loaded.',
      { pagination: buildPaginationMeta(page, limit, total) },
    ),
  );
}

export async function getIncidentDeskRecordHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...deskRoles);

  const { incidentId } = incidentIdParamsSchema.parse(request.params);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const payload = await service.getIncidentDeskRecord(request.server.prisma, incidentId, scopeHostelNames);
  reply.send(successResponse(payload, 'Incident record loaded.'));
}

export async function acknowledgeIncidentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...wardenRoles);

  const { incidentId } = incidentIdParamsSchema.parse(request.params);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.acknowledgeIncident(
    request.server.prisma,
    incidentId,
    user.id,
    scopeHostelNames,
  );
  reply.send(successResponse({ record }, 'Incident acknowledged.'));
}

export async function markIncidentInProgressHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...wardenRoles);

  const { incidentId } = incidentIdParamsSchema.parse(request.params);
  const body = incidentActionBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.markIncidentInProgress(
    request.server.prisma,
    incidentId,
    user.id,
    body,
    scopeHostelNames,
  );
  reply.send(successResponse({ record }, 'Incident marked in progress.'));
}

export async function patchIncidentSeverityHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...wardenRoles);

  const { incidentId } = incidentIdParamsSchema.parse(request.params);
  const body = patchIncidentSeverityBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.updateIncidentSeverity(
    request.server.prisma,
    incidentId,
    user.id,
    body,
    scopeHostelNames,
  );
  reply.send(successResponse({ record }, 'Incident severity updated.'));
}

export async function resolveIncidentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...wardenRoles);

  const { incidentId } = incidentIdParamsSchema.parse(request.params);
  const body = resolveIncidentBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const record = await service.resolveIncident(
    request.server.prisma,
    incidentId,
    user.id,
    body,
    scopeHostelNames,
  );
  reply.send(successResponse({ record }, 'Incident resolved.'));
}
