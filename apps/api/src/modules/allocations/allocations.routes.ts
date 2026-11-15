import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  assignStudentToBedHandler,
  getAllocationDirectoryByIdHandler,
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

function withAdminOrWardenAssignAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN'),
    ],
  };
}

const adminOrWardenAssign = withAdminOrWardenAssignAuth();

export const allocationsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', adminOrWarden, getAllocationDirectorySummary);
  app.get('/directory/queue', adminOrWarden, listAllocationQueueHandler);
  app.get('/directory/:allocationId', adminOrWarden, getAllocationDirectoryByIdHandler);
  app.get('/directory', adminOrWarden, listAllocationDirectoryHandler);
  app.post('/assign', adminOrWardenAssign, assignStudentToBedHandler);
};
