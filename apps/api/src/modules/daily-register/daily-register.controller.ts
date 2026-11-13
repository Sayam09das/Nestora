import { dailyRegisterDeskQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import {
  assertHostelFilterInScope,
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './daily-register.service.js';

const deskRoles = ['UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD'] as const;

export async function getDailyRegisterDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...deskRoles);

  const query = dailyRegisterDeskQuerySchema.parse(request.query);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    assertHostelFilterInScope(query.hostel, scopeHostelNames);
  }

  const summary = await service.getDailyRegisterDeskSummary(
    request.server.prisma,
    query,
    scopeHostelNames,
  );
  reply.send(successResponse({ summary }, 'Daily register summary loaded.'));
}

export async function listDailyRegisterDeskEntriesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, ...deskRoles);

  const query = dailyRegisterDeskQuerySchema.parse(request.query);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    assertHostelFilterInScope(query.hostel, scopeHostelNames);
  }

  const entries = await service.listDailyRegisterDeskEntries(
    request.server.prisma,
    query,
    scopeHostelNames,
  );
  reply.send(successResponse({ entries }, 'Daily register entries loaded.'));
}
