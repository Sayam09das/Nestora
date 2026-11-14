import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAdminDashboardOverviewHandler,
  getStaffAttendanceHandler,
  getStaffDashboardOverviewHandler,
  getStaffScheduleHandler,
  getWardenDashboardOverviewHandler,
} from './dashboard.controller.js';
import { getStaffReportDeskHandler, postStaffReportHandler } from './staff-report.controller.js';
import {
  getStaffSettingsDeskHandler,
  patchStaffSettingsNotificationsHandler,
  postStaffRevokeOtherSessionsHandler,
} from './staff-settings.controller.js';

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
    '/staff/schedule',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    getStaffScheduleHandler,
  );
  app.get(
    '/staff/attendance',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    getStaffAttendanceHandler,
  );
  app.get(
    '/staff/report',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    getStaffReportDeskHandler,
  );
  app.post(
    '/staff/report',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    postStaffReportHandler,
  );
  app.get(
    '/staff/settings',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    getStaffSettingsDeskHandler,
  );
  app.patch(
    '/staff/settings/notifications',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    patchStaffSettingsNotificationsHandler,
  );
  app.post(
    '/staff/settings/sessions/revoke-others',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    postStaffRevokeOtherSessionsHandler,
  );
};
