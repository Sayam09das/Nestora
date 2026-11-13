import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getHostelDirectoryByIdHandler,
  getHostelDirectorySummary,
  listHostelDirectoryHandler,
} from './hostels.controller.js';

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

export const hostelsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOnly, getHostelDirectorySummary);
  app.get('/directory/:hostelId', adminOnly, getHostelDirectoryByIdHandler);
  app.get('/directory', adminOnly, listHostelDirectoryHandler);
};
