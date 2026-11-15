import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getBedDirectoryByIdHandler,
  getBedDirectorySummary,
  listBedDirectoryHandler,
} from './beds.controller.js';

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

export const bedsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOrWarden, getBedDirectorySummary);
  app.get('/directory/:bedId', adminOrWarden, getBedDirectoryByIdHandler);
  app.get('/directory', adminOrWarden, listBedDirectoryHandler);
};
