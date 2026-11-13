import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  clearNightAttendanceMarkHandler,
  getNightAttendanceSessionHandler,
  upsertNightAttendanceMarkHandler,
} from './attendance.controller.js';

function withAdminOrWardenAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF'),
    ],
  };
}

const adminOrWarden = withAdminOrWardenAuth();

export const attendanceRoutes: FastifyPluginAsync = async (app) => {
  app.get('/night-session', adminOrWarden, getNightAttendanceSessionHandler);
  app.patch('/night-session/mark', adminOrWarden, upsertNightAttendanceMarkHandler);
  app.post('/night-session/clear', adminOrWarden, clearNightAttendanceMarkHandler);
};
