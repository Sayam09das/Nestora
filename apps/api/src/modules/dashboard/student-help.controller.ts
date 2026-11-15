import type { FastifyReply, FastifyRequest } from 'fastify';
import { createStudentHelpRequestBodySchema } from '@nestora/validators';

import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import { getStudentHelpDesk, submitStudentHelpRequest } from './student-help.service.js';

export async function getStudentHelpHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentHelpDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student help desk.'));
}

export async function postStudentHelpRequestHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = createStudentHelpRequestBodySchema.parse(request.body);
  const desk = await submitStudentHelpRequest(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Support request submitted.'));
}