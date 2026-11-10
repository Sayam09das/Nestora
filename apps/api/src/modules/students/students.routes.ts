import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAdminStudentProfileHandler,
  getStudentDirectorySummary,
  listStudentDirectoryHandler,
  registerStudentHandler,
} from './students.controller.js';

const adminOnly = requireRoles('UNIVERSITY_ADMINISTRATOR');

export const studentsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', { preHandler: [adminOnly] }, getStudentDirectorySummary);
  app.get('/directory', { preHandler: [adminOnly] }, listStudentDirectoryHandler);
  app.post('/register', { preHandler: [adminOnly] }, registerStudentHandler);
  app.get('/:userId/profile', { preHandler: [adminOnly] }, getAdminStudentProfileHandler);
};
