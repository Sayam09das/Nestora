import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import { getRoomDirectorySummary, listRoomDirectoryHandler } from './rooms.controller.js';

function withAdminAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR'),
    ],
  };
}

const adminOnly = withAdminAuth();

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

export const roomsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOrWarden, getRoomDirectorySummary);
  app.get('/directory', adminOrWarden, listRoomDirectoryHandler);
};
