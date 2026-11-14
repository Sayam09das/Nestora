import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getDailyRegisterDeskSummaryHandler,
  listDailyRegisterDeskEntriesHandler,
} from './daily-register.controller.js';

function withRoles(...roles: ('UNIVERSITY_ADMINISTRATOR' | 'HOSTEL_WARDEN' | 'HOSTEL_STAFF' | 'SECURITY_GUARD')[]) {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles(...roles),
    ],
  };
}

const deskAuth = withRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD');

export const dailyRegisterRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', deskAuth, getDailyRegisterDeskSummaryHandler);
  app.get('/desk/entries', deskAuth, listDailyRegisterDeskEntriesHandler);
};
