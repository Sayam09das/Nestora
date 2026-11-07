import type { Prisma, PrismaClient, Role, UserStatus } from '@nestora/database';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import * as auditService from '../audit/audit.service.js';
import { revokeAllUserSessions } from './session.service.js';

export type AdminUserListQuery = {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: Role;
  q?: string;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  status: UserStatus;
  isVerified: boolean;
  mfaEnabled: boolean;
  assignedHostelIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

function toAdminUserSummary(
  u: Prisma.UserGetPayload<{
    include: { hostelAssignments: { select: { hostelId: true } } };
  }>,
): AdminUserSummary {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    phoneNumber: u.phoneNumber,
    status: u.status,
    isVerified: u.isVerified,
    mfaEnabled: u.mfaEnabled,
    assignedHostelIds: u.hostelAssignments.map((a) => a.hostelId),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function listUsersForAdmin(
  prisma: PrismaClient,
  query: AdminUserListQuery,
): Promise<{ users: AdminUserSummary[]; pagination: ReturnType<typeof buildPaginationMeta> }> {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { page: safePage, limit: safeLimit, skip } = normalizePagination(page, limit);

  const where: Prisma.UserWhereInput = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.role) {
    where.role = query.role;
  }
  if (query.q?.trim()) {
    const term = query.q.trim();
    where.OR = [
      { email: { contains: term, mode: 'insensitive' } },
      { firstName: { contains: term, mode: 'insensitive' } },
      { lastName: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: [{ createdAt: 'desc' }],
      include: { hostelAssignments: { select: { hostelId: true } } },
    }),
  ]);

  return {
    users: rows.map(toAdminUserSummary),
    pagination: buildPaginationMeta(safePage, safeLimit, total),
  };
}

export async function getUserForAdmin(
  prisma: PrismaClient,
  userId: string,
): Promise<AdminUserSummary> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: { hostelAssignments: { select: { hostelId: true } } },
  });
  if (!u) {
    throw new NotFoundError('User not found.');
  }
  return toAdminUserSummary(u);
}

async function assertNotLastActiveAdmin(
  prisma: PrismaClient,
  targetUserId: string,
  nextRole?: Role,
  nextStatus?: UserStatus,
): Promise<void> {
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, status: true },
  });
  if (target?.role !== 'UNIVERSITY_ADMINISTRATOR' || target?.status !== 'ACTIVE') {
    return;
  }

  const demoting =
    (nextRole !== undefined && nextRole !== 'UNIVERSITY_ADMINISTRATOR') ||
    (nextStatus !== undefined && nextStatus !== 'ACTIVE');

  if (!demoting) {
    return;
  }

  const otherActiveAdmins = await prisma.user.count({
    where: {
      role: 'UNIVERSITY_ADMINISTRATOR',
      status: 'ACTIVE',
      NOT: { id: targetUserId },
    },
  });
  if (otherActiveAdmins === 0) {
    throw new BadRequestError('At least one active University Administrator must remain.');
  }
}

export async function updateUserStatusByAdmin(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  userId: string,
  status: UserStatus,
  ip: string | undefined,
): Promise<AdminUserSummary> {
  if (actor.id === userId && status !== 'ACTIVE') {
    throw new ForbiddenError('You cannot deactivate or suspend your own account.');
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new NotFoundError('User not found.');
  }

  await assertNotLastActiveAdmin(prisma, userId, undefined, status);

  const priorStatus = existing.status;

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: { status },
      include: { hostelAssignments: { select: { hostelId: true } } },
    });
    if (status !== 'ACTIVE' && priorStatus === 'ACTIVE') {
      await revokeAllUserSessions(tx, userId);
    }
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: actor.id,
      actorRole: actor.role,
      actionName: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: userId,
      ipAddress: ip ?? null,
      previousState: { status: priorStatus },
      newState: { status },
    });
    return u;
  });

  return toAdminUserSummary(updated);
}

export async function updateUserRoleByAdmin(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  userId: string,
  role: Role,
  ip: string | undefined,
): Promise<AdminUserSummary> {
  if (actor.id === userId) {
    throw new ForbiddenError('You cannot change your own role.');
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new NotFoundError('User not found.');
  }

  await assertNotLastActiveAdmin(prisma, userId, role, undefined);

  const priorRole = existing.role;

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: { role },
      include: { hostelAssignments: { select: { hostelId: true } } },
    });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: actor.id,
      actorRole: actor.role,
      actionName: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: userId,
      ipAddress: ip ?? null,
      previousState: { role: priorRole },
      newState: { role },
    });
    return u;
  });

  return toAdminUserSummary(updated);
}

export async function revokeAllUserSessionsByAdmin(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  userId: string,
  ip: string | undefined,
): Promise<{ revoked: true }> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new NotFoundError('User not found.');
  }

  await prisma.$transaction(async (tx) => {
    await revokeAllUserSessions(tx, userId);
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: actor.id,
      actorRole: actor.role,
      actionName: 'USER_SESSIONS_REVOKED_BY_ADMIN',
      entityType: 'User',
      entityId: userId,
      ipAddress: ip ?? null,
    });
  });

  return { revoked: true };
}
