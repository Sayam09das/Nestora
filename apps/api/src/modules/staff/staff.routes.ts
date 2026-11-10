import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAdminStaffProfileHandler,
  getStaffDirectorySummary,
  listStaffDirectoryHandler,
  registerStaffHandler,
} from './staff.controller.js';

const adminOnly = requireRoles('UNIVERSITY_ADMINISTRATOR');

export const staffRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', { preHandler: [adminOnly] }, getStaffDirectorySummary);
  app.get('/directory', { preHandler: [adminOnly] }, listStaffDirectoryHandler);
  app.post('/register', { preHandler: [adminOnly] }, registerStaffHandler);
  app.get('/:userId/profile', { preHandler: [adminOnly] }, getAdminStaffProfileHandler);
};
