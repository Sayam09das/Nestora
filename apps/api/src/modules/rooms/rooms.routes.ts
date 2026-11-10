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

export const roomsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOnly, getRoomDirectorySummary);
  app.get('/directory', adminOnly, listRoomDirectoryHandler);
};
