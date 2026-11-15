import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { notificationRoutes } from './notification.routes.js';

const notificationsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(notificationRoutes, { prefix: '/notifications' });
};

export const notificationsPlugin = fp(notificationsPluginImpl, {
  name: 'mod07-notifications',
  dependencies: ['prisma'],
});

export {
  createNotification,
  createNotifications,
  listNotificationsForUser,
} from './notification.service.js';
export {
  notifyComplaintSubmitted,
  notifyIncidentReported,
  notifyLeaveApplicationSubmitted,
  notifyLeaveDecision,
} from './notification-events.service.js';