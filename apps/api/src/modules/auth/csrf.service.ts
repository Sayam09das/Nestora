import { timingSafeEqual } from 'node:crypto';
import { createOpaqueToken } from '../../lib/crypto-token.js';
import { CSRF_COOKIE_NAME } from './auth.constants.js';

export function issueCsrfToken(
  reply: {
    setCookie: (name: string, value: string, opts: Record<string, unknown>) => void;
  },
  opts: { secure: boolean; sameSite: 'lax' | 'strict' | 'none' },
): string {
  const token = createOpaqueToken();
  reply.setCookie(CSRF_COOKIE_NAME, token, {
    path: '/',
    httpOnly: false,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: 3600,
  });
  return token;
}

export function verifyCsrfHeader(
  cookieToken: string | undefined,
  headerToken: string | undefined,
): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }
  const a = Buffer.from(cookieToken, 'utf8');
  const b = Buffer.from(headerToken, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
