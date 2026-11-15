import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getOutingDeskSummaryHandler,
  listOutingDeskApplicationsHandler,
  patchOutingDecisionHandler,
} from './outing.controller.js';

function withDeskAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF'),
    ],
  };
}

const deskAuth = withDeskAuth();

export const outingRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', deskAuth, getOutingDeskSummaryHandler);
  app.get('/desk/applications', deskAuth, listOutingDeskApplicationsHandler);
  app.patch(
    '/desk/applications/:outingId/decision',
    {
      preHandler: [
        async (request: FastifyRequest) => {
          requireAuth(request);
        },
        requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN'),
      ],
    },
    patchOutingDecisionHandler,
  );
};