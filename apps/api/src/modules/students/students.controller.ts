import {
  registerStudentBodySchema,
  studentDirectoryListQuerySchema,
  userIdParamsSchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './students.service.js';

export async function getStudentDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const summary = await service.getStudentDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Student directory summary.'));
}

export async function listStudentDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = studentDirectoryListQuerySchema.parse(request.query);
  const { students, pagination } = await service.listStudentDirectory(
    request.server.prisma,
    query,
  );
  reply.send(paginatedSuccessResponse({ students }, 'Student directory loaded.', pagination));
}

export async function getAdminStudentProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const { userId } = userIdParamsSchema.parse(request.params);
  const profile = await service.getAdminStudentProfile(request.server.prisma, userId);
  reply.send(successResponse({ profile }, 'Student profile loaded.'));
}

export async function registerStudentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const body = registerStudentBodySchema.parse(request.body);
  const result = await service.registerStudentByAdmin(
    request.server.prisma,
    request.server.config,
    user.id,
    user.role,
    body,
    request.ip,
  );
  reply.status(201).send(
    successResponse(
      { student: result },
      'Student registered. An activation link was sent to the login email.',
    ),
  );
}
