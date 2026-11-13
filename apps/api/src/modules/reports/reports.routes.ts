import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getReportDeskPreviewHandler,
  getReportDeskTemplateHandler,
  getReportsDeskSummaryHandler,
  listReportsDeskTemplatesHandler,
} from './reports.controller.js';

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

export const reportsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', adminOrWarden, getReportsDeskSummaryHandler);
  app.get('/desk/templates', adminOrWarden, listReportsDeskTemplatesHandler);
  app.get('/desk/templates/:reportId', adminOrWarden, getReportDeskTemplateHandler);
  app.get('/desk/templates/:reportId/preview', adminOrWarden, getReportDeskPreviewHandler);
};
