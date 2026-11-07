import type { SessionUser } from '@nestora/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import * as service from './infrastructure.service.js';

export async function getUniversities(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = request.user as SessionUser;
  const rows = await service.listUniversitiesService(request.server.prisma, actor);
  reply.send(successResponse({ universities: rows }, 'Universities loaded.'));
}

export async function postUniversity(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = request.user as SessionUser;
  const created = await service.createUniversityService(
    request.server.prisma,
    actor,
    request.body,
    typeof request.ip === 'string' ? request.ip : undefined,
  );
  reply.status(201).send(successResponse({ university: created }, 'University created.'));
}
