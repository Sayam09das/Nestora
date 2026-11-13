import { roleIdParamsSchema, rolesDeskListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './roles.service.js';

export async function getRolesDeskSummaryHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const summary = await service.getRolesDeskSummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Roles desk summary loaded.'));
}

export async function listRolesDeskHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = rolesDeskListQuerySchema.parse(request.query);
  const roles = await service.listRolesDeskProfiles(request.server.prisma, query);
  reply.send(successResponse({ roles }, 'Role profiles loaded.'));
}

export async function getRoleDeskHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const { roleId } = roleIdParamsSchema.parse(request.params);
  const result = await service.getRoleDeskProfile(request.server.prisma, roleId);
  if (!result) throw new NotFoundError('Role not found.');
  reply.send(successResponse(result, 'Role profile loaded.'));
}
