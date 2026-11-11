import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAllocationDirectorySummary,
  listAllocationDirectoryHandler,
  listAllocationQueueHandler,
} from './allocations.controller.js';

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

export const allocationsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOrWarden, getAllocationDirectorySummary);
  app.get('/directory/queue', adminOrWarden, listAllocationQueueHandler);
  app.get('/directory', adminOrWarden, listAllocationDirectoryHandler);
};
