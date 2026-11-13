import {
  reportPreviewQuerySchema,
  reportTemplateIdParamsSchema,
  reportsDeskListQuerySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { successResponse } from '../../common/api-response.js';
import {
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './reports.service.js';

export async function getReportsDeskSummaryHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const t0 = performance.now();
  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getReportsDeskSummary(request.server.prisma, hostelNames, performance.now() - t0);
    reply.send(successResponse({ summary }, 'Reports desk summary loaded.'));
    return;
  }

  const summary = await service.getReportsDeskSummary(request.server.prisma, undefined, performance.now() - t0);
  reply.send(successResponse({ summary }, 'Reports desk summary loaded.'));
}

export async function listReportsDeskTemplatesHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = reportsDeskListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const templates = await service.listReportsDeskTemplates(request.server.prisma, query, hostelNames);
    reply.send(successResponse({ templates }, 'Report templates loaded.'));
    return;
  }

  const templates = await service.listReportsDeskTemplates(request.server.prisma, query);
  reply.send(successResponse({ templates }, 'Report templates loaded.'));
}

export async function getReportDeskTemplateHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { reportId } = reportTemplateIdParamsSchema.parse(request.params);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (!service.assertReportInScope(reportId, hostelNames)) {
      throw new NotFoundError('Report not found.');
    }
    const report = await service.getReportDeskTemplateById(request.server.prisma, reportId, hostelNames);
    if (!report) throw new NotFoundError('Report not found.');
    reply.send(successResponse({ report }, 'Report template loaded.'));
    return;
  }

  const report = await service.getReportDeskTemplateById(request.server.prisma, reportId);
  if (!report) throw new NotFoundError('Report not found.');
  reply.send(successResponse({ report }, 'Report template loaded.'));
}

export async function getReportDeskPreviewHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { reportId } = reportTemplateIdParamsSchema.parse(request.params);
  const query = reportPreviewQuerySchema.parse(request.query);
  const hostel = query.hostel && query.hostel !== 'All Hostels' ? query.hostel : undefined;

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    if (!service.assertReportInScope(reportId, hostelNames)) {
      throw new NotFoundError('Report not found.');
    }
    const preview = await service.getReportDeskPreview(
      request.server.prisma,
      reportId,
      hostelNames,
      hostel,
      query.period,
    );
    if (!preview) throw new NotFoundError('Report not found.');
    reply.send(successResponse({ preview }, 'Report preview loaded.'));
    return;
  }

  const preview = await service.getReportDeskPreview(request.server.prisma, reportId, undefined, hostel, query.period);
  if (!preview) throw new NotFoundError('Report not found.');
  reply.send(successResponse({ preview }, 'Report preview loaded.'));
}
