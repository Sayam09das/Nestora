import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import { getAdminDashboardOverview } from './dashboard.service.js';
import { getOperationalDashboardOverview } from './operational-dashboard.service.js';
import {
  defaultStaffAttendanceRange,
  getStaffAttendanceDesk,
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
