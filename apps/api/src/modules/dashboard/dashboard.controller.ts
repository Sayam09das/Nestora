import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import { getAdminDashboardOverview } from './dashboard.service.js';
import { getOperationalDashboardOverview } from './operational-dashboard.service.js';
import { getStudentDashboardOverview } from './student-dashboard.service.js';
import {
  getStudentAttendanceDesk,
  parseStudentAttendanceMonthParam,
} from './student-attendance.service.js';
import { getStudentRoommatesDesk } from './student-roommates.service.js';
import { createStudentLeaveApplication, getStudentLeaveDesk } from './student-leave.service.js';
import { createStudentOutingRequest, getStudentOutingDesk } from './student-outing.service.js';
import { getStudentGatePassesDesk } from './student-gate-passes.service.js';
import {
  createStudentComplaintTicket,
  getStudentComplaintsDesk,
} from './student-complaints.service.js';
import {
  createStudentMaintenanceRequest,
  getStudentMaintenanceDesk,
} from './student-maintenance.service.js';
import {
  createStudentVisitorRequest,
  getStudentVisitorDesk,
} from './student-visitor.service.js';
import { getStudentFeesDesk } from './student-fees.service.js';
import {
  acknowledgeStudentNotice,
  getStudentAnnouncementsDesk,
} from './student-announcements.service.js';
import { getStudentEventsDesk } from './student-events.service.js';
import { getStudentRulesDesk } from './student-rules.service.js';
import { getStudentEmergencyDesk, reportStudentEmergency } from './student-emergency.service.js';
import {
  getStudentSelfProfileDesk,
  updateStudentSelfProfileDesk,
} from './student-self-profile.service.js';
import {
  createStudentComplaintBodySchema,
  createStudentMaintenanceBodySchema,
  createStudentVisitorBodySchema,
  createStudentLeaveBodySchema,
  createStudentOutingBodySchema,
  studentAcknowledgeNoticeBodySchema,
  studentReportIncidentBodySchema,
  updateStudentSelfProfileBodySchema,
} from '@nestora/validators';
import {
  defaultStaffAttendanceRange,
  getStaffAttendanceDesk,
  recordStaffShiftCheckIn,
  parseAttendanceDateParam,
} from './staff-attendance.service.js';
import {
  defaultStaffScheduleRange,
  getStaffDutySchedule,
  parseScheduleDateParam,
} from './staff-schedule.service.js';

export async function getAdminDashboardOverviewHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const overview = await getAdminDashboardOverview(request.server.prisma);
  reply.send(successResponse({ overview }, 'Admin dashboard overview.'));
}

export async function getWardenDashboardOverviewHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_WARDEN');

  const overview = await getOperationalDashboardOverview(
    request.server.prisma,
    user.id,
    'HOSTEL_WARDEN',
  );
  reply.send(successResponse({ overview }, 'Warden dashboard overview.'));
}

export async function getStaffDashboardOverviewHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const overview = await getOperationalDashboardOverview(
    request.server.prisma,
    user.id,
    'HOSTEL_STAFF',
  );
  reply.send(successResponse({ overview }, 'Staff dashboard overview.'));
}

export async function getStudentDashboardOverviewHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const overview = await getStudentDashboardOverview(request.server.prisma, user.id);
  reply.send(successResponse({ overview }, 'Student dashboard overview.'));
}

export async function getStudentVisitorsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentVisitorDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student visitor desk.'));
}

export async function getStudentFeesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentFeesDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student fees desk.'));
}

export async function getStudentAnnouncementsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentAnnouncementsDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student announcements desk.'));
}

export async function postStudentAcknowledgeNoticeHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = studentAcknowledgeNoticeBodySchema.parse(request.body);
  const desk = await acknowledgeStudentNotice(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Notice acknowledged.'));
}

export async function getStudentEventsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentEventsDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student events desk.'));
}

export async function getStudentRulesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentRulesDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student rules desk.'));
}

export async function getStudentEmergencyHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentEmergencyDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student emergency desk.'));
}

export async function postStudentEmergencyReportHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = studentReportIncidentBodySchema.parse(request.body);
  const desk = await reportStudentEmergency(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Emergency reported. Warden has been notified.'));
}

export async function postStudentVisitorsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = createStudentVisitorBodySchema.parse(request.body);
  const desk = await createStudentVisitorRequest(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Visitor request submitted.'));
}

export async function getStudentMaintenanceHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentMaintenanceDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student maintenance desk.'));
}

export async function postStudentMaintenanceHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = createStudentMaintenanceBodySchema.parse(request.body);
  const desk = await createStudentMaintenanceRequest(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Maintenance request submitted.'));
}

export async function getStudentComplaintsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentComplaintsDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student complaints desk.'));
}

export async function postStudentComplaintHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = createStudentComplaintBodySchema.parse(request.body);
  const desk = await createStudentComplaintTicket(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Complaint submitted.'));
}

export async function getStudentLeaveHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentLeaveDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student leave desk.'));
}

export async function getStudentGatePassesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentGatePassesDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student gate passes desk.'));
}

export async function postStudentLeaveHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = createStudentLeaveBodySchema.parse(request.body);
  const desk = await createStudentLeaveApplication(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Leave request submitted.'));
}

export async function getStudentOutingsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentOutingDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student outing desk.'));
}

export async function postStudentOutingHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = createStudentOutingBodySchema.parse(request.body);
  const desk = await createStudentOutingRequest(request.server.prisma, user.id, body);
  reply.send(successResponse({ desk }, 'Outing request submitted.'));
}

export async function getStudentRoommatesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentRoommatesDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Student roommates desk.'));
}

export async function getStudentAttendanceHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const query = request.query as { month?: string };
  const monthAnchor = parseStudentAttendanceMonthParam(query.month);
  const desk = await getStudentAttendanceDesk(request.server.prisma, user.id, monthAnchor);
  reply.send(successResponse({ desk }, 'Student attendance desk.'));
}

export async function getStudentSelfProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const desk = await getStudentSelfProfileDesk(
    request.server.prisma,
    request.server.config,
    user.id,
  );
  reply.send(successResponse({ desk }, 'Student profile desk.'));
}

export async function patchStudentSelfProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'STUDENT');

  const body = updateStudentSelfProfileBodySchema.parse(request.body);
  const desk = await updateStudentSelfProfileDesk(
    request.server.prisma,
    request.server.config,
    user.id,
    body,
  );
  reply.send(successResponse({ desk }, 'Student profile updated.'));
}

export async function getStaffScheduleHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const defaults = defaultStaffScheduleRange();
  const query = request.query as { from?: string; to?: string };
  const from = parseScheduleDateParam(query.from, defaults.from);
  const to = parseScheduleDateParam(query.to, defaults.to);
  const rangeEnd = from <= to ? to : from;

  const schedule = await getStaffDutySchedule(request.server.prisma, user.id, from, rangeEnd);
  reply.send(successResponse({ schedule }, 'Staff duty schedule.'));
}

export async function getStaffAttendanceHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const defaults = defaultStaffAttendanceRange();
  const query = request.query as { from?: string; to?: string };
  const from = parseAttendanceDateParam(query.from, defaults.from);
  const to = parseAttendanceDateParam(query.to, defaults.to);
  const rangeEnd = from <= to ? to : from;

  const desk = await getStaffAttendanceDesk(request.server.prisma, user.id, from, rangeEnd);
  reply.send(successResponse({ desk }, 'Staff attendance desk.'));
}

export async function postStaffShiftCheckInHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'HOSTEL_STAFF');

  const desk = await recordStaffShiftCheckIn(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Shift check-in recorded.'));
}
