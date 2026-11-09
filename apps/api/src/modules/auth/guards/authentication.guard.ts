import type { FastifyRequest } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../../../common/errors/index.js';
import type { SessionContext } from '../auth.types.js';

export function requireAuthenticated(request: FastifyRequest): SessionContext {
  const ctx = request.sessionContext;
  if (!ctx) {
    throw new UnauthorizedError('Authentication required.');
  }
  if (!ctx.user.isVerified) {
    throw new ForbiddenError('Email verification is required.');
  }
  if (ctx.requiresMfa) {
    throw new ForbiddenError('Multi-factor verification is required for this session.');
  }
  return ctx;
}

export function optionalSession(request: FastifyRequest): SessionContext | undefined {
  return request.sessionContext;
}

/** Blocks when MFA step is pending (should be rare if middleware is strict). */
export function requireMfaComplete(request: FastifyRequest): void {
  const ctx = requireAuthenticated(request);
  if (ctx.requiresMfa) {
    throw new ForbiddenError('Complete multi-factor verification first.');
  }
}
