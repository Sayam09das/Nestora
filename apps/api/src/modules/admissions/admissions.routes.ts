import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import { postAdmissionTier1Handler, postAdmissionTier2Handler } from './admissions.controller.js';

export const admissionsRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/applications/:applicationId/tier-1',
    { preHandler: [requireRoles('UNIVERSITY_ADMINISTRATOR')] },
    postAdmissionTier1Handler,
  );
  app.post(
    '/applications/:applicationId/tier-2',
    { preHandler: [requireRoles('HOSTEL_WARDEN')] },
    postAdmissionTier2Handler,
  );
};