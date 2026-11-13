import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import { getAdminDashboardOverview } from './dashboard.service.js';
import { getOperationalDashboardOverview } from './operational-dashboard.service.js';
import { getStudentDashboardOverview } from './student-dashboard.service.js';

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

  const query = request.query as { hostelId?: string };
  const overview = await getOperationalDashboardOverview(
    request.server.prisma,
    user.id,
    'HOSTEL_WARDEN',
    query.hostelId,
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
