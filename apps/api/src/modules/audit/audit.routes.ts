import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import { getAuditDeskSummaryHandler, getAuditLogByIdHandler, getAuditLogs } from './audit.controller.js';

const adminOnly = {
  preHandler: [
    async (request: FastifyRequest) => {
      requireAuth(request);
    },
    requireRoles('UNIVERSITY_ADMINISTRATOR'),
  ],
};

export const auditRoutes: FastifyPluginAsync = async (app) => {
  app.get('/audit-logs/desk/summary', adminOnly, getAuditDeskSummaryHandler);
  app.get('/audit-logs', adminOnly, getAuditLogs);
  app.get('/audit-logs/:auditLogId', adminOnly, getAuditLogByIdHandler);
};
