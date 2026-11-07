import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import { getAuditLogs } from './audit.controller.js';

export const auditRoutes: FastifyPluginAsync = async (app) => {
  app.get('/audit-logs', { preHandler: requireRoles('UNIVERSITY_ADMINISTRATOR') }, getAuditLogs);
};
