import type { Prisma, PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import { createUniversityBodySchema } from '@nestora/validators';
import { assertRole } from '../../middleware/authorize.js';
import * as auditService from '../audit/audit.service.js';
import * as repository from './infrastructure.repository.js';

export async function listUniversitiesService(prisma: PrismaClient, actor: SessionUser) {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR');
  return repository.listUniversities(prisma);
}

export async function createUniversityService(
  prisma: PrismaClient,
  actor: SessionUser,
  body: unknown,
  ipAddress: string | undefined,
) {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR');
  const parsed = createUniversityBodySchema.parse(body);
  return prisma.$transaction(async (tx) => {
    const created = await repository.createUniversity(tx, {
      name: parsed.name,
      code: parsed.code,
      address: parsed.address,
      contactEmail: parsed.contactEmail,
    });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: actor.id,
      actorRole: actor.role,
      actionName: 'UNIVERSITY_CREATED',
      entityType: 'University',
      entityId: created.id,
      newState: JSON.parse(JSON.stringify(created)) as Prisma.InputJsonValue,
      ipAddress: ipAddress ?? null,
    });
    return created;
  });
}
