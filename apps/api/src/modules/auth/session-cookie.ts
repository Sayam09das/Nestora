import type { Env } from '../../config/index.js';
import { sessionCookieName } from './auth.constants.js';

export function sessionCookieOptions(env: Env) {
  const isProd = env.NODE_ENV === 'production';
  return {
    path: '/' as const,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: env.SESSION_TTL_HOURS * 3600,
  };
}

export function refreshSessionCookieIfPresent(
  env: Env,
  cookies: Record<string, string | undefined>,
  hasSession: boolean,
  setCookie: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void,
): void {
  if (!hasSession) {
    return;
  }
  const name = sessionCookieName(env.NODE_ENV === 'production');
  const raw = cookies[name];
  if (!raw) {
    return;
  }
  setCookie(name, raw, sessionCookieOptions(env));
}
