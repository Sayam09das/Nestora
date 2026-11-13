import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAnnouncementDeskHandler,
  getAnnouncementsDeskSummaryHandler,
  listAnnouncementsDeskHandler,
} from './announcements.controller.js';

function withDeskAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF'),
    ],
  };
}

const deskAuth = withDeskAuth();

export const announcementsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', deskAuth, getAnnouncementsDeskSummaryHandler);
  app.get('/desk/notices', deskAuth, listAnnouncementsDeskHandler);
  app.get('/desk/notices/:noticeId', deskAuth, getAnnouncementDeskHandler);
};
