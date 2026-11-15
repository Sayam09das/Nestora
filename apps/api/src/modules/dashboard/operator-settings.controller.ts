import type { FastifyReply, FastifyRequest } from 'fastify';
import { studentNotificationPreferencesBodySchema } from '@nestora/validators';

import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import {
  getOperatorNotificationPreferences,
  patchOperatorNotificationPreferences,
} from './operator-settings.service.js';

export async function getWardenSettingsNotificationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');
  const notifications = await getOperatorNotificationPreferences(request.server.prisma, user.id);
  reply.send(successResponse({ notifications }, 'Warden notification preferences loaded.'));
}

export async function patchWardenSettingsNotificationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');
  const body = studentNotificationPreferencesBodySchema.parse(request.body);
  const notifications = await patchOperatorNotificationPreferences(request.server.prisma, user.id, body);
  reply.send(successResponse({ notifications }, 'Warden notification preferences updated.'));
}

export async function getAdminSettingsNotificationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');
  const notifications = await getOperatorNotificationPreferences(request.server.prisma, user.id);
  reply.send(successResponse({ notifications }, 'Administrator notification preferences loaded.'));
}

export async function patchAdminSettingsNotificationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');
  const body = studentNotificationPreferencesBodySchema.parse(request.body);
  const notifications = await patchOperatorNotificationPreferences(request.server.prisma, user.id, body);
  reply.send(successResponse({ notifications }, 'Administrator notification preferences updated.'));
}