import type { FastifyRequest } from 'fastify';
import { MustChangePasswordError } from '../common/errors/index.js';

const EXACT_PATHS = new Set([
  '/',
  '/health',
  '/health/live',
  '/health/ready',
  '/api/v1',
  '/api/v1/auth/csrf-token',
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/activate',
  '/api/v1/auth/me',
  '/api/v1/auth/session',
  '/api/v1/auth/role-dashboards',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/reset-with-link',
  '/api/v1/auth/password/change',
  '/api/v1/auth/mfa/verify-session',
]);

function requestPath(request: FastifyRequest): string {
  const raw = request.url.split('?')[0] ?? request.url;
  return raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function isPasswordChangeExempt(path: string): boolean {
  if (EXACT_PATHS.has(path)) {
    return true;
  }
  if (path.startsWith('/api/v1/auth/password/reset-with-link')) {
    return true;
  }
  return false;
}

/** FR-008: after an administrative temporary password, only exempt routes may run until password change. */
export function enforcePasswordChangeGate(request: FastifyRequest): void {
  const user = request.user;
  if (!user?.mustChangePassword) {
    return;
  }
  if (isPasswordChangeExempt(requestPath(request))) {
    return;
  }
  throw new MustChangePasswordError();
}
