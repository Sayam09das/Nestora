import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  getNotificationUnreadCountHandler,
  listNotificationsHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from './notification.controller.js';

const auth = {
  preHandler: [
    async (request: FastifyRequest) => {
      requireAuth(request);
    },
  ],
};

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', auth, listNotificationsHandler);
  app.get('/unread-count', auth, getNotificationUnreadCountHandler);
  app.post('/read-all', auth, markAllNotificationsReadHandler);
  app.patch('/:notificationId/read', auth, markNotificationReadHandler);
};