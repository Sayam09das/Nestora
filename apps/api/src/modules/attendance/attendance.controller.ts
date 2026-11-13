import {
  clearNightAttendanceMarkBodySchema,
  nightAttendanceSessionQuerySchema,
  upsertNightAttendanceMarkBodySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import {
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './attendance.service.js';

export async function getNightAttendanceSessionHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = nightAttendanceSessionQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const session = await service.getNightAttendanceSession(
      request.server.prisma,
      query.date,
      hostelNames,
    );
    reply.send(successResponse(session, 'Night attendance session loaded.'));
    return;
  }

  const session = await service.getNightAttendanceSession(request.server.prisma, query.date);
  reply.send(successResponse(session, 'Night attendance session loaded.'));
}

export async function upsertNightAttendanceMarkHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const body = upsertNightAttendanceMarkBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  const row = await service.upsertNightAttendanceMark(request.server.prisma, {
    dateIso: body.date,
    studentId: body.studentId,
    mark: body.mark,
    recordedBy: user.id,
    scopeHostelNames,
  });

  reply.send(successResponse({ row }, 'Attendance mark saved.'));
}

export async function clearNightAttendanceMarkHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const body = clearNightAttendanceMarkBodySchema.parse(request.body);

  let scopeHostelNames: string[] | undefined;
  if (isHostelOperationalRole(user.role)) {
    scopeHostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
  }

  await service.clearNightAttendanceMark(request.server.prisma, {
    dateIso: body.date,
    studentId: body.studentId,
    scopeHostelNames,
  });

  reply.send(successResponse({}, 'Attendance mark cleared.'));
}
