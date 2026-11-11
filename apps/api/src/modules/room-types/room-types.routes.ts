import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import { getRoomTypeDirectorySummary, listRoomTypeDirectoryHandler } from './room-types.controller.js';

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

export const roomTypesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOnly, getRoomTypeDirectorySummary);
  app.get('/directory', adminOnly, listRoomTypeDirectoryHandler);
};
