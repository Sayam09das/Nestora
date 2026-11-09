import type { SessionUser } from '@nestora/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../common/errors/index.js';
import { sessionCookieName } from '../modules/auth/auth.constants.js';
import { validateAndLoadSession } from '../modules/auth/session.service.js';

export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const env = request.server.config;
  const cookieName = sessionCookieName(env.NODE_ENV === 'production');
  const raw = request.cookies[cookieName];
  if (!raw) {
    return;
  }

  const ctx = await validateAndLoadSession(request.server.prisma, raw, env);
  if (!ctx) {
    return;
  }

  const user = ctx.user;
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    isVerified: user.isVerified,
    mfaEnabled: user.mfaEnabled,
    mustChangePassword: user.mustChangePassword,
    assignedHostelIds: user.assignedHostelIds,
  };

  request.sessionContext = ctx;
  request.user = sessionUser;
}

export function requireAuth(request: FastifyRequest): SessionUser {
  if (!request.user) {
    throw new UnauthorizedError('Authentication required.');
  }
  if (!request.user.isVerified) {
    throw new ForbiddenError('Email verification is required.');
  }
  if (request.sessionContext?.requiresMfa) {
    throw new ForbiddenError('Multi-factor verification is required for this session.');
  }
  return request.user;
}

export function getSessionCookieName(isProduction: boolean): string {
  return sessionCookieName(isProduction);
}
