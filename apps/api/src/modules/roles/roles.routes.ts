import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import { getRoleDeskHandler, getRolesDeskSummaryHandler, listRolesDeskHandler } from './roles.controller.js';

function withUniversityAdminAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR'),
    ],
  };
}

const universityAdmin = withUniversityAdminAuth();

export const rolesDeskRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', universityAdmin, getRolesDeskSummaryHandler);
  app.get('/desk/roles', universityAdmin, listRolesDeskHandler);
  app.get('/desk/roles/:roleId', universityAdmin, getRoleDeskHandler);
};
