import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getLeaveDeskApplicationHandler,
  getLeaveDeskSummaryHandler,
  listLeaveDeskApplicationsHandler,
  patchLeaveDecisionHandler,
} from './leave.controller.js';

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

export const leaveRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', adminOrWarden, getLeaveDeskSummaryHandler);
  app.get('/desk/applications', adminOrWarden, listLeaveDeskApplicationsHandler);
  app.get('/desk/applications/:leaveId', adminOrWarden, getLeaveDeskApplicationHandler);
  app.patch('/desk/applications/:leaveId/decision', adminOrWarden, patchLeaveDecisionHandler);
};
