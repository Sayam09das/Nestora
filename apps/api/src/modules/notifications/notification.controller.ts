import {
  notificationIdParamsSchema,
  notificationListQuerySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  getUnreadCount,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.service.js';

export async function listNotificationsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  const query = notificationListQuerySchema.parse(request.query);
  const inbox = await listNotificationsForUser(request.server.prisma, user.id, {
    page: query.page,
    limit: query.limit,
    unreadOnly: query.unreadOnly,
  });
  reply.send(successResponse({ inbox }, 'Notification inbox.'));
}

export async function getNotificationUnreadCountHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  const count = await getUnreadCount(request.server.prisma, user.id);
  reply.send(successResponse({ count }, 'Unread notification count.'));
}

export async function markNotificationReadHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  const { notificationId } = notificationIdParamsSchema.parse(request.params);
  const row = await markNotificationRead(request.server.prisma, user.id, notificationId);
  reply.send(successResponse({ notification: row }, 'Notification marked read.'));
}

export async function markAllNotificationsReadHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  const count = await markAllNotificationsRead(request.server.prisma, user.id);
  reply.send(successResponse({ count }, 'All notifications marked read.'));
}