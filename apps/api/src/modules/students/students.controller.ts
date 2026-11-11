import {
  registerStudentBodySchema,
  studentDirectoryListQuerySchema,
  userIdParamsSchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { ForbiddenError } from '../../common/errors/index.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import {
  assertHostelFilterInScope,
  hostelNameInScope,
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './students.service.js';

export async function getStudentDirectorySummary(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getStudentDirectorySummaryForHostels(
      request.server.prisma,
      hostelNames,
    );
    reply.send(successResponse({ summary }, 'Student directory summary.'));
    return;
  }

  const summary = await service.getStudentDirectorySummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Student directory summary.'));
}

export async function listStudentDirectoryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = studentDirectoryListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (hostelNames.length === 0) {
      const page = query.page ?? DEFAULT_PAGE;
      const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
      const { page: safePage, limit: safeLimit } = normalizePagination(page, limit);
      reply.send(
        paginatedSuccessResponse(
          { students: [] },
          'Student directory loaded.',
          buildPaginationMeta(safePage, safeLimit, 0),
        ),
      );
      return;
    }
    assertHostelFilterInScope(query.hostel, hostelNames);

    const { students, pagination } = await service.listStudentDirectory(request.server.prisma, {
      ...query,
      scopeHostelNames: hostelNames,
    });
    reply.send(paginatedSuccessResponse({ students }, 'Student directory loaded.', pagination));
    return;
  }

  const { students, pagination } = await service.listStudentDirectory(
    request.server.prisma,
    query,
  );
  reply.send(paginatedSuccessResponse({ students }, 'Student directory loaded.', pagination));
}

export async function getAdminStudentProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { userId } = userIdParamsSchema.parse(request.params);
  const profile = await service.getAdminStudentProfile(request.server.prisma, userId);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const studentHostel = profile.housing?.hostelName;
    if (!studentHostel || !hostelNameInScope(studentHostel, hostelNames)) {
      throw new ForbiddenError('You are not authorized to view this student profile.');
    }
  }

  reply.send(successResponse({ profile }, 'Student profile loaded.'));
}

export async function registerStudentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const body = registerStudentBodySchema.parse(request.body);
  const result = await service.registerStudentByAdmin(
    request.server.prisma,
    request.server.config,
    user.id,
    user.role,
    body,
    request.ip,
  );
  reply.status(201).send(
    successResponse(
      { student: result },
      'Student registered. An activation link was sent to the login email.',
    ),
  );
}
