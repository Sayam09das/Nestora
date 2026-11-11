import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAdminStudentProfileHandler,
  getStudentDirectorySummary,
  listStudentDirectoryHandler,
  registerStudentHandler,
} from './students.controller.js';

const adminOnly = requireRoles('UNIVERSITY_ADMINISTRATOR');
const adminOrOperational = requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

export const studentsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/directory/summary', { preHandler: [adminOrOperational] }, getStudentDirectorySummary);
  app.get('/directory', { preHandler: [adminOrOperational] }, listStudentDirectoryHandler);
  app.post('/register', { preHandler: [adminOnly] }, registerStudentHandler);
  app.get('/:userId/profile', { preHandler: [adminOrOperational] }, getAdminStudentProfileHandler);
};
