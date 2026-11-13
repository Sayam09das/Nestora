import { announcementIdParamsSchema, announcementsDeskListQuerySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import {
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './announcements.service.js';

export async function getAnnouncementsDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getAnnouncementsDeskSummary(request.server.prisma, hostelNames);
    reply.send(successResponse({ summary }, 'Announcements desk summary loaded.'));
    return;
  }

  const summary = await service.getAnnouncementsDeskSummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Announcements desk summary loaded.'));
}

export async function listAnnouncementsDeskHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = announcementsDeskListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const result = await service.listAnnouncementsDesk(request.server.prisma, query, hostelNames);
    reply.send(paginatedSuccessResponse({ notices: result.notices }, 'Announcements loaded.', result.pagination));
    return;
  }

  const result = await service.listAnnouncementsDesk(request.server.prisma, query);
  reply.send(paginatedSuccessResponse({ notices: result.notices }, 'Announcements loaded.', result.pagination));
}

export async function getAnnouncementDeskHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { noticeId } = announcementIdParamsSchema.parse(request.params);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const notice = await service.getAnnouncementDeskById(request.server.prisma, noticeId, hostelNames);
    if (!notice) throw new NotFoundError('Notice not found.');
    reply.send(successResponse({ notice }, 'Notice loaded.'));
    return;
  }

  const notice = await service.getAnnouncementDeskById(request.server.prisma, noticeId);
  if (!notice) throw new NotFoundError('Notice not found.');
  reply.send(successResponse({ notice }, 'Notice loaded.'));
}
