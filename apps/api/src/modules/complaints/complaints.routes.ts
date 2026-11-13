import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  assignComplaintTicketHandler,
  getComplaintDeskTicketHandler,
  getComplaintsDeskSummaryHandler,
  listComplaintsDeskTicketsHandler,
} from './complaints.controller.js';

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

export const complaintsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', adminOrWarden, getComplaintsDeskSummaryHandler);
  app.get('/desk/tickets', adminOrWarden, listComplaintsDeskTicketsHandler);
  app.get('/desk/tickets/:ticketId', adminOrWarden, getComplaintDeskTicketHandler);
  app.post('/desk/tickets/:ticketId/assign', adminOrWarden, assignComplaintTicketHandler);
};
