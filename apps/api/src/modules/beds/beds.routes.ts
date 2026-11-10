import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import { getBedDirectorySummary, listBedDirectoryHandler } from './beds.controller.js';

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

export const bedsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOnly, getBedDirectorySummary);
  app.get('/directory', adminOnly, listBedDirectoryHandler);
};
