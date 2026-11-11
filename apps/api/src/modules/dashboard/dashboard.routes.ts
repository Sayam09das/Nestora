import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAdminDashboardOverviewHandler,
  getStaffDashboardOverviewHandler,
  getStudentDashboardOverviewHandler,
  getWardenDashboardOverviewHandler,
} from './dashboard.controller.js';

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/admin/overview',
    {
      preHandler: [requireRoles('UNIVERSITY_ADMINISTRATOR')],
    },
    getAdminDashboardOverviewHandler,
  );
  app.get(
    '/warden/overview',
    {
      preHandler: [requireRoles('HOSTEL_WARDEN')],
    },
    getWardenDashboardOverviewHandler,
  );
  app.get(
    '/staff/overview',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    getStaffDashboardOverviewHandler,
  );
  app.get(
    '/student/overview',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentDashboardOverviewHandler,
  );
};
