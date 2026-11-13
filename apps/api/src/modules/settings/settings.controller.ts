import { settingsDeskListQuerySchema, settingsPanelIdParamsSchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './settings.service.js';

export async function getSettingsDeskSummaryHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const t0 = performance.now();
  const summary = await service.getSettingsDeskSummary(request.server.prisma, request.server.config, performance.now() - t0);
  reply.send(successResponse({ summary }, 'Settings desk summary loaded.'));
}

export async function listSettingsDeskPanelsHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const query = settingsDeskListQuerySchema.parse(request.query);
  const panels = await service.listSettingsDeskPanels(request.server.prisma, query);
  reply.send(successResponse({ panels }, 'Settings panels loaded.'));
}

export async function getSettingsPanelDetailHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');

  const { panelId } = settingsPanelIdParamsSchema.parse(request.params);
  const detail = await service.getSettingsPanelDetail(request.server.prisma, panelId, request.server.config);
  if (!detail) throw new NotFoundError('Settings panel not found.');
  reply.send(successResponse(detail, 'Settings panel loaded.'));
}
