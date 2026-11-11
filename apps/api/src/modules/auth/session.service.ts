import type { PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import { UnauthorizedError } from '../../common/errors/index.js';

type DbWithSession = Pick<PrismaClient, 'session'>;

import type { Env } from '../../config/env.js';
import { createOpaqueToken, sha256Hex } from '../../lib/crypto-token.js';
import type { SessionContext } from './auth.types.js';

export function sessionAbsoluteExpiry(env: Env): Date {
  return new Date(Date.now() + env.SESSION_TTL_HOURS * 3600 * 1000);
}

export async function createSessionRecord(
  prisma: DbWithSession,
  input: {
    userId: string;
    ip: string | undefined;
    userAgent: string | undefined;
    env: Env;
    mfaVerified: boolean;
  },
): Promise<{ rawToken: string; sessionId: string }> {
  const rawToken = createOpaqueToken();
  const sessionTokenHash = sha256Hex(rawToken);
  const expiresAt = sessionAbsoluteExpiry(input.env);
  const row = await prisma.session.create({
    data: {
      userId: input.userId,
      sessionTokenHash,
      ipAddress: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt,
      lastActivityAt: new Date(),
      mfaVerifiedAt: input.mfaVerified ? new Date() : null,
    },
  });
  return { rawToken, sessionId: row.id };
}

export async function validateAndLoadSession(
  prisma: PrismaClient,
  rawToken: string | undefined,
  env: Env,
): Promise<SessionContext | null> {
  if (!rawToken) {
    return null;
  }
  const hash = sha256Hex(rawToken);
  const session = await prisma.session.findFirst({
    where: {
      sessionTokenHash: hash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: { hostelAssignments: { select: { hostelId: true } } },
      },
    },
  });
  if (!session) {
    return null;
  }
  const now = new Date();
  if (session.user.status !== 'ACTIVE') {
    return null;
  }
  const idleMs = env.SESSION_IDLE_TIMEOUT_MINUTES * 60 * 1000;
  if (now.getTime() - session.lastActivityAt.getTime() > idleMs) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: now },
    });
    return null;
  }
  if (session.expiresAt <= now) {
    return null;
  }

  const absoluteExpiry = sessionAbsoluteExpiry(env);
  await prisma.session.update({
    where: { id: session.id },
    data: {
      lastActivityAt: now,
      expiresAt: absoluteExpiry,
    },
  });

  const requiresMfa = Boolean(session.user.mfaEnabled) && session.mfaVerifiedAt === null;

  return {
    sessionId: session.id,
    requiresMfa,
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      status: session.user.status,
      isVerified: session.user.isVerified,
      mfaEnabled: session.user.mfaEnabled,
      mustChangePassword: session.user.mustChangePassword,
      assignedHostelIds: session.user.hostelAssignments.map((h) => h.hostelId),
    },
  };
}

export function sessionContextToUser(ctx: SessionContext): SessionUser {
  const u = ctx.user;
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    status: u.status,
    isVerified: u.isVerified,
    mfaEnabled: u.mfaEnabled,
    mustChangePassword: u.mustChangePassword,
    assignedHostelIds: u.assignedHostelIds,
  };
}

/** Requires a valid session (may be unverified or pending MFA). */
export function requireSessionContext(request: {
  sessionContext?: SessionContext;
}): SessionContext {
  const ctx = request.sessionContext;
  if (!ctx) {
    throw new UnauthorizedError('Authentication required.');
  }
  if (ctx.user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Authentication required.');
  }
  return ctx;
}

export async function getCurrentSessionRow(
  prisma: PrismaClient,
  sessionId: string,
  userId: string,
) {
  return prisma.session.findFirst({
    where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: new Date() } },
    select: {
      id: true,
      createdAt: true,
      lastActivityAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
      mfaVerifiedAt: true,
    },
  });
}

export async function revokeSession(
  prisma: DbWithSession,
  sessionId: string,
  userId: string,
): Promise<boolean> {
  const res = await prisma.session.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return res.count > 0;
}

export async function revokeOtherSessions(
  prisma: DbWithSession,
  userId: string,
  keepSessionId: string,
): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null, NOT: { id: keepSessionId } },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserSessions(prisma: DbWithSession, userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeSessionByRawToken(
  prisma: DbWithSession,
  rawToken: string | undefined,
): Promise<void> {
  if (!rawToken) {
    return;
  }
  const sessionTokenHash = sha256Hex(rawToken);
  await prisma.session.updateMany({
    where: { sessionTokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function deleteSessionByRawToken(
  prisma: DbWithSession,
  rawToken: string | undefined,
): Promise<void> {
  if (!rawToken) {
    return;
  }
  const sessionTokenHash = sha256Hex(rawToken);
  await prisma.session.deleteMany({ where: { sessionTokenHash } });
}

export async function markSessionMfaVerified(
  prisma: DbWithSession,
  sessionId: string,
  userId: string,
): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { mfaVerifiedAt: new Date() },
  });
}

export async function listActiveSessions(prisma: PrismaClient, userId: string) {
  return prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      lastActivityAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
    },
  });
}
