import type { SessionUser } from '@nestora/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../common/errors/index.js';
import { requireAuth } from './authenticate.js';

export type RoleCode =
  | 'UNIVERSITY_ADMINISTRATOR'
  | 'HOSTEL_WARDEN'
  | 'STUDENT'
  | 'HOSTEL_STAFF'
  | 'SECURITY_GUARD'
  | 'ACCOUNTANT';

export function requireRoles(...allowed: RoleCode[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = requireAuth(request);
    if (!allowed.includes(user.role as RoleCode)) {
      throw new ForbiddenError('You do not have permission to perform this action.');
    }
  };
}

/**
 * Same as requireRoles but allows unverified users (e.g. email verification flows).
 * Still rejects when MFA is pending on the session.
 */
export function requireRolesRelaxedVerification(...allowed: RoleCode[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required.');
    }
    if (request.sessionContext?.requiresMfa) {
      throw new ForbiddenError('Multi-factor verification is required for this session.');
    }
    const user = request.user;
    if (!allowed.includes(user.role as RoleCode)) {
      throw new ForbiddenError('You do not have permission to perform this action.');
    }
  };
}

export function assertRole(user: SessionUser, ...allowed: RoleCode[]): void {
  if (!allowed.includes(user.role as RoleCode)) {
    throw new ForbiddenError('You do not have permission to perform this action.');
  }
}
