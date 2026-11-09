import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { isAllowedOrigin } from '../config/cors-origins.js';
import type { Env } from '../config/env.js';
import { CSRF_COOKIE_NAME } from '../modules/auth/auth.constants.js';
import { verifyCsrfHeader } from '../modules/auth/csrf.service.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const CSRF_SKIP_PREFIXES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/register/verify-otp',
  '/api/v1/auth/register/resend-otp',
  '/api/v1/auth/activate',
  '/api/v1/auth/password/reset-with-link',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/verify-otp',
  '/api/v1/auth/password/reset',
  '/api/v1/auth/email/verify-request',
  '/api/v1/auth/email/verify-complete',
  '/api/v1/auth/csrf-token',
];

export const csrfPlugin: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  const env = opts.env;

  app.addHook('preValidation', async (request, reply) => {
    if (!MUTATING.has(request.method)) {
      return;
    }
    const path = request.url.split('?')[0] ?? '';
    if (!path.startsWith('/api/v1')) {
      return;
    }

    if (CSRF_SKIP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
      return;
    }

    const headerRequestedWith = request.headers['x-nestora-requested-with'] === 'XMLHttpRequest';
    const origin = request.headers.origin;
    const referer = request.headers.referer ?? '';

    const originOk =
      (typeof origin === 'string' && isAllowedOrigin(env, origin)) ||
      (typeof referer === 'string' &&
        referer.length > 0 &&
        refererMatchesAllowedOrigin(referer, env));

    const cookieToken =
      typeof request.cookies[CSRF_COOKIE_NAME] === 'string'
        ? request.cookies[CSRF_COOKIE_NAME]
        : undefined;
    const headerToken =
      typeof request.headers['x-csrf-token'] === 'string'
        ? request.headers['x-csrf-token']
        : undefined;

    const csrfOk = verifyCsrfHeader(cookieToken, headerToken);

    if (!headerRequestedWith || !originOk || !csrfOk) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'CSRF_VALIDATION_FAILED',
          message: 'Invalid or missing CSRF protections.',
        },
      });
    }
  });
};

function refererMatchesAllowedOrigin(referer: string, env: Env): boolean {
  try {
    const u = new URL(referer);
    const o = `${u.protocol}//${u.host}`;
    return isAllowedOrigin(env, o);
  } catch {
    return false;
  }
}

export const csrfPluginWrapped = fp(csrfPlugin, { name: 'csrf' });
