import { cookieSecureFlag, resolveCookieSameSite } from '../../config/cookie-same-site.js';
import type { Env } from '../../config/index.js';
import { sessionCookieName } from './auth.constants.js';

export function sessionCookieOptions(env: Env) {
  const sameSite = resolveCookieSameSite(env);
  return {
    path: '/' as const,
    httpOnly: true,
    secure: cookieSecureFlag(env),
    sameSite,
    maxAge: env.SESSION_TTL_HOURS * 3600,
  };
}

export function sessionCookieClearOptions(env: Env) {
  const { path, sameSite, secure } = sessionCookieOptions(env);
  return { path, sameSite, secure };
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
