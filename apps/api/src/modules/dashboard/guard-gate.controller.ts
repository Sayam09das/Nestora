import {
  guardGateLookupBodySchema,
  guardGatePassActionBodySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import {
  getGuardGateConsoleDesk,
  lookupGuardGatePass,
  recordGuardGateExit,
  recordGuardGateReturn,
} from './guard-gate.service.js';

export async function getGuardGateConsoleHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'SECURITY_GUARD');

  const desk = await getGuardGateConsoleDesk(request.server.prisma, user.id);
  reply.send(successResponse({ desk }, 'Guard gate console desk.'));
}

export async function postGuardGateLookupHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'SECURITY_GUARD');

  const body = guardGateLookupBodySchema.parse(request.body);
  const result = await lookupGuardGatePass(request.server.prisma, user.id, body.token);
  reply.send(successResponse({ result }, 'Gate pass lookup.'));
}

export async function postGuardGateExitHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'SECURITY_GUARD');

  const body = guardGatePassActionBodySchema.parse(request.body);
  const result = await recordGuardGateExit(
    request.server.prisma,
    user.id,
    body.passId,
    body.remarks,
  );
  reply.send(successResponse({ result }, 'Exit recorded at gate.'));
}

export async function postGuardGateReturnHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'SECURITY_GUARD');

  const body = guardGatePassActionBodySchema.parse(request.body);
  const result = await recordGuardGateReturn(
    request.server.prisma,
    user.id,
    body.passId,
    body.remarks,
  );
  reply.send(successResponse({ result }, 'Return recorded at gate.'));
}