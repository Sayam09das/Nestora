import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  approveVisitorHandler,
  checkInVisitorHandler,
  checkOutVisitorHandler,
  getVisitorDeskSummaryHandler,
  listVisitorDeskRecordsHandler,
  registerVisitorHandler,
  rejectVisitorHandler,
} from './visitor.controller.js';

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
const wardenRoles = withRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

export const visitorRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', deskRoles, getVisitorDeskSummaryHandler);
  app.get('/desk/records', deskRoles, listVisitorDeskRecordsHandler);
  app.post('/register', deskRoles, registerVisitorHandler);
  app.patch('/:visitorId/approve', wardenRoles, approveVisitorHandler);
  app.patch('/:visitorId/reject', wardenRoles, rejectVisitorHandler);
  app.patch('/:visitorId/check-in', deskRoles, checkInVisitorHandler);
  app.patch('/:visitorId/check-out', deskRoles, checkOutVisitorHandler);
};
