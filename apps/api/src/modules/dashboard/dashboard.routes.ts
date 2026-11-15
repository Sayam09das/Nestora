import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAdminDashboardOverviewHandler,
  getStaffAttendanceHandler,
  postStaffShiftCheckInHandler,
  postStaffShiftCheckOutHandler,
  getStaffDashboardOverviewHandler,
  getStaffScheduleHandler,
  getStudentDashboardOverviewHandler,
  getStudentAttendanceHandler,
  getStudentRoommatesHandler,
  getStudentVisitorsHandler,
  postStudentVisitorsHandler,
  getStudentFeesHandler,
  getStudentAnnouncementsHandler,
  postStudentAcknowledgeNoticeHandler,
  getStudentEventsHandler,
  getStudentRulesHandler,
  getStudentEmergencyHandler,
  postStudentEmergencyReportHandler,
  getStudentMaintenanceHandler,
  postStudentMaintenanceHandler,
  getStudentComplaintsHandler,
  postStudentComplaintHandler,
  getStudentLeaveHandler,
  postStudentLeaveHandler,
  getStudentOutingsHandler,
  postStudentOutingHandler,
  getStudentGatePassesHandler,
  getStudentSelfProfileHandler,
  patchStudentSelfProfileHandler,
  getWardenDashboardOverviewHandler,
} from './dashboard.controller.js';
import { getStaffReportDeskHandler, postStaffReportHandler } from './staff-report.controller.js';
import {
  getStaffSettingsDeskHandler,
  patchStaffSettingsNotificationsHandler,
  postStaffRevokeOtherSessionsHandler,
} from './staff-settings.controller.js';
import {
  getGuardGateConsoleHandler,
  postGuardGateExitHandler,
  postGuardGateLookupHandler,
  postGuardGateReturnHandler,
} from './guard-gate.controller.js';
import {
  getStudentSettingsDeskHandler,
  patchStudentSettingsNotificationsHandler,
  postStudentRevokeOtherSessionsHandler,
} from './student-settings.controller.js';
import {
  getAdminSettingsNotificationsHandler,
  getWardenSettingsNotificationsHandler,
  patchAdminSettingsNotificationsHandler,
  patchWardenSettingsNotificationsHandler,
} from './operator-settings.controller.js';
import { getStudentHelpHandler, postStudentHelpRequestHandler } from './student-help.controller.js';

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
  app.get(
    '/student/attendance',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentAttendanceHandler,
  );
  app.get(
    '/student/roommates',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentRoommatesHandler,
  );
  app.get(
    '/student/visitors',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentVisitorsHandler,
  );
  app.post(
    '/student/visitors',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentVisitorsHandler,
  );
  app.get(
    '/student/fees',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentFeesHandler,
  );
  app.get(
    '/student/announcements',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentAnnouncementsHandler,
  );
  app.post(
    '/student/announcements/acknowledge',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentAcknowledgeNoticeHandler,
  );
  app.get(
    '/student/events',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentEventsHandler,
  );
  app.get(
    '/student/rules',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentRulesHandler,
  );
  app.get(
    '/student/emergency',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentEmergencyHandler,
  );
  app.post(
    '/student/emergency/report',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentEmergencyReportHandler,
  );
  app.get(
    '/student/maintenance',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentMaintenanceHandler,
  );
  app.post(
    '/student/maintenance',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentMaintenanceHandler,
  );
  app.get(
    '/student/complaints',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentComplaintsHandler,
  );
  app.post(
    '/student/complaints',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentComplaintHandler,
  );
  app.get(
    '/student/leave',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentLeaveHandler,
  );
  app.post(
    '/student/leave',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentLeaveHandler,
  );
  app.get(
    '/student/outings',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentOutingsHandler,
  );
  app.post(
    '/student/outings',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentOutingHandler,
  );
  app.get(
    '/student/gate-passes',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentGatePassesHandler,
  );
  app.get(
    '/student/settings',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentSettingsDeskHandler,
  );
  app.patch(
    '/student/settings/notifications',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    patchStudentSettingsNotificationsHandler,
  );
  app.post(
    '/student/settings/sessions/revoke-others',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentRevokeOtherSessionsHandler,
  );
  app.get(
    '/student/help',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentHelpHandler,
  );
  app.post(
    '/student/help/request',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    postStudentHelpRequestHandler,
  );
  app.get(
    '/student/profile',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    getStudentSelfProfileHandler,
  );
  app.patch(
    '/student/profile',
    {
      preHandler: [requireRoles('STUDENT')],
    },
    patchStudentSelfProfileHandler,
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
  app.post(
    '/staff/attendance/check-in',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    postStaffShiftCheckInHandler,
  );
  app.post(
    '/staff/attendance/check-out',
    {
      preHandler: [requireRoles('HOSTEL_STAFF')],
    },
    postStaffShiftCheckOutHandler,
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
  app.get(
    '/warden/settings/notifications',
    { preHandler: [requireRoles('HOSTEL_WARDEN')] },
    getWardenSettingsNotificationsHandler,
  );
  app.patch(
    '/warden/settings/notifications',
    { preHandler: [requireRoles('HOSTEL_WARDEN')] },
    patchWardenSettingsNotificationsHandler,
  );
  app.get(
    '/admin/settings/notifications',
    { preHandler: [requireRoles('UNIVERSITY_ADMINISTRATOR')] },
    getAdminSettingsNotificationsHandler,
  );
  app.patch(
    '/admin/settings/notifications',
    { preHandler: [requireRoles('UNIVERSITY_ADMINISTRATOR')] },
    patchAdminSettingsNotificationsHandler,
  );
  app.get(
    '/guard/gate-console',
    {
      preHandler: [requireRoles('SECURITY_GUARD')],
    },
    getGuardGateConsoleHandler,
  );
  app.post(
    '/guard/gate-console/lookup',
    {
      preHandler: [requireRoles('SECURITY_GUARD')],
    },
    postGuardGateLookupHandler,
  );
  app.post(
    '/guard/gate-console/exit',
    {
      preHandler: [requireRoles('SECURITY_GUARD')],
    },
    postGuardGateExitHandler,
  );
  app.post(
    '/guard/gate-console/return',
    {
      preHandler: [requireRoles('SECURITY_GUARD')],
    },
    postGuardGateReturnHandler,
  );
};
