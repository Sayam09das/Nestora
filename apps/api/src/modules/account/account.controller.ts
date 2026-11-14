import { updateSelfProfileBodySchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import * as service from './account.service.js';

export async function getAccountDeskHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  const currentSessionId = request.sessionContext?.sessionId;
  const desk = await service.getAccountDesk(
    request.server.prisma,
    request.server.config,
    user.id,
    currentSessionId,
  );
  reply.send(successResponse({ desk }, 'Account desk loaded.'));
}

export async function patchAccountDeskProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  const body = updateSelfProfileBodySchema.parse(request.body);
  const profile = await service.updateSelfAccountProfile(
    request.server.prisma,
    request.server.config,
    user.id,
    body,
  );
  reply.send(successResponse({ profile }, 'Profile updated.'));
}
