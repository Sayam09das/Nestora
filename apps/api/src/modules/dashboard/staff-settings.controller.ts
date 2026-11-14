import type { FastifyReply, FastifyRequest } from 'fastify';
import { staffNotificationPreferencesBodySchema } from '@nestora/validators';

import { errorResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as authService from '../auth/auth.service.js';
import {
  getStaffSettingsDesk,
  listStaffSettingsSessions,
  updateStaffNotificationPreferences,
} from './staff-settings.service.js';

export async function getStaffSettingsDeskHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const currentSessionId = request.sessionContext?.sessionId;
  const [desk, sessions] = await Promise.all([
    getStaffSettingsDesk(request.server.prisma, user.id),
    listStaffSettingsSessions(request.server.prisma, user.id, currentSessionId),
  ]);
  reply.send(successResponse({ desk, sessions }, 'Staff settings desk.'));
}

export async function patchStaffSettingsNotificationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const body = staffNotificationPreferencesBodySchema.parse(request.body);
  const notifications = await updateStaffNotificationPreferences(request.server.prisma, user.id, body);
  reply.send(successResponse({ notifications }, 'Notification preferences updated.'));
}

export async function postStaffRevokeOtherSessionsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

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