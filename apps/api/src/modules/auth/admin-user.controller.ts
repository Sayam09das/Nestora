import type { Role } from '@nestora/database';
import {
  adminAuthActivityQuerySchema,
  adminListUsersQuerySchema,
  adminSetTemporaryPasswordBodySchema,
  adminUpdateUserRoleBodySchema,
  adminUpdateUserStatusBodySchema,
  userIdParamsSchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import * as adminUserService from './admin-user.service.js';
import * as authActivityService from './auth-activity.service.js';

export async function getAdminAuthActivity(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = adminAuthActivityQuerySchema.parse(request.query);
  const { events, pagination } = await authActivityService.listAuthActivityForAdmin(
    request.server.prisma,
    query,
  );
  reply.send(paginatedSuccessResponse({ events }, 'Auth activity loaded.', pagination));
}

export async function getAdminUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = adminListUsersQuerySchema.parse(request.query);
  const { users, pagination } = await adminUserService.listUsersForAdmin(
    request.server.prisma,
    query,
  );
  reply.send(paginatedSuccessResponse({ users }, 'Users loaded.', pagination));
}

export async function getAdminUserById(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = userIdParamsSchema.parse(request.params);
  const user = await adminUserService.getUserForAdmin(request.server.prisma, userId);
  reply.send(successResponse({ user }, 'User loaded.'));
}

export async function patchAdminUserStatus(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = requireAuth(request);
  const { userId } = userIdParamsSchema.parse(request.params);
  const body = adminUpdateUserStatusBodySchema.parse(request.body);
  const user = await adminUserService.updateUserStatusByAdmin(
    request.server.prisma,
    { id: actor.id, role: actor.role as Role },
    userId,
    body.status,
    request.ip,
  );
  reply.send(successResponse({ user }, 'User status updated.'));
}

export async function patchAdminUserRole(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = requireAuth(request);
  const { userId } = userIdParamsSchema.parse(request.params);
  const body = adminUpdateUserRoleBodySchema.parse(request.body);
  const user = await adminUserService.updateUserRoleByAdmin(
    request.server.prisma,
    { id: actor.id, role: actor.role as Role },
    userId,
    body.role,
    request.ip,
  );
  reply.send(successResponse({ user }, 'User role updated.'));
}

export async function postAdminRevokeUserSessions(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = requireAuth(request);
  const { userId } = userIdParamsSchema.parse(request.params);
  const result = await adminUserService.revokeAllUserSessionsByAdmin(
    request.server.prisma,
    { id: actor.id, role: actor.role as Role },
    userId,
    request.ip,
  );
  reply.send(successResponse(result, 'All active sessions for this user were revoked.'));
}

export async function postAdminSetTemporaryPassword(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = requireAuth(request);
  const { userId } = userIdParamsSchema.parse(request.params);
  const body = adminSetTemporaryPasswordBodySchema.parse(request.body);
  const user = await adminUserService.setTemporaryPasswordByAdmin(
    request.server.prisma,
    request.server.config,
    { id: actor.id, role: actor.role as Role },
    userId,
    body.temporaryPassword,
    request.ip,
  );
  reply.send(successResponse({ user }, 'Temporary password set; user must change it on login.'));
}
