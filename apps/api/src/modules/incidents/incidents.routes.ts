import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  acknowledgeIncidentHandler,
  getIncidentDeskRecordHandler,
  getIncidentsDeskSummaryHandler,
  listIncidentsDeskRecordsHandler,
  markIncidentInProgressHandler,
  patchIncidentSeverityHandler,
  resolveIncidentHandler,
} from './incidents.controller.js';

function withRoles(
  ...roles: ('UNIVERSITY_ADMINISTRATOR' | 'HOSTEL_WARDEN' | 'HOSTEL_STAFF' | 'SECURITY_GUARD')[]
) {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles(...roles),
    ],
  };
}

const deskRoles = withRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD');
const wardenRoles = withRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN');

export const incidentRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', deskRoles, getIncidentsDeskSummaryHandler);
  app.get('/desk/records', deskRoles, listIncidentsDeskRecordsHandler);
  app.get('/desk/:incidentId', deskRoles, getIncidentDeskRecordHandler);
  app.patch('/desk/:incidentId/acknowledge', wardenRoles, acknowledgeIncidentHandler);
  app.patch('/desk/:incidentId/in-progress', wardenRoles, markIncidentInProgressHandler);
  app.patch('/desk/:incidentId/severity', wardenRoles, patchIncidentSeverityHandler);
  app.patch('/desk/:incidentId/resolve', wardenRoles, resolveIncidentHandler);
};
