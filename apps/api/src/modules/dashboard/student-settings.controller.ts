import type { FastifyReply, FastifyRequest } from 'fastify';
import { studentNotificationPreferencesBodySchema } from '@nestora/validators';

import { errorResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as authService from '../auth/auth.service.js';
import {
  getStudentSettingsDesk,
  listStudentSettingsSessions,
  updateStudentNotificationPreferences,
} from './student-settings.service.js';

export async function getStudentSettingsDeskHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const currentSessionId = request.sessionContext?.sessionId;
  const [desk, sessions] = await Promise.all([
    getStudentSettingsDesk(request.server.prisma, user.id),
    listStudentSettingsSessions(request.server.prisma, user.id, currentSessionId),
  ]);
  reply.send(successResponse({ desk, sessions }, 'Student settings desk.'));
}

export async function patchStudentSettingsNotificationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = studentNotificationPreferencesBodySchema.parse(request.body);
  const notifications = await updateStudentNotificationPreferences(request.server.prisma, user.id, body);
  reply.send(successResponse({ notifications }, 'Notification preferences updated.'));
}

export async function postStudentRevokeOtherSessionsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const ctx = request.sessionContext;
  if (!ctx) {
    return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated.', {}));
  }

  await authService.revokeAllOtherSessionsForUser(
    request.server.prisma,
    user.id,
    ctx.sessionId,
    request.ip,
    user.role,
  );
  reply.send(successResponse({ revoked: true }, 'Other sessions revoked.'));
}