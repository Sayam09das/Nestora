import { registerStaffBodySchema, staffDirectoryListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './staff.service.js';

export async function getStaffDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const variant =
    (request.query as { variant?: string }).variant === 'wardens' ? 'wardens' : 'all';
  const summary = await service.getStaffDirectorySummary(request.server.prisma, variant);
  reply.send(successResponse({ summary }, 'Staff directory summary.'));
}

export async function registerStaffHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const body = registerStaffBodySchema.parse(request.body);
  const result = await service.registerStaffByAdmin(
    request.server.prisma,
    request.server.config,
    user.id,
    user.role,
    body,
    request.ip,
  );
  reply.status(201).send(successResponse({ staff: result }, 'Staff member registered.'));
}

export async function getAdminStaffProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const { userId } = request.params as { userId: string };
  const profile = await service.getAdminStaffProfile(
    request.server.prisma,
    request.server.config,
    userId,
  );
  reply.send(successResponse({ profile }, 'Staff profile loaded.'));
}

export async function listStaffDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = staffDirectoryListQuerySchema.parse(request.query);
  const { staff, pagination } = await service.listStaffDirectory(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ staff }, 'Staff directory loaded.', pagination));
}
