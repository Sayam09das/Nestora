import type { Env } from './env.js';

export type CookieSameSite = 'lax' | 'none' | 'strict';

function urlHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

/** Public API origin used for host comparison (split web vs API deploy). */
export function resolveApiPublicOrigin(env: Env): string {
  if (env.API_URL) {
    return env.API_URL;
  }
  const host = env.HOST === '0.0.0.0' ? 'localhost' : env.HOST;
  return `http://${host}:${env.PORT}`;
}

/**
 * Cross-origin browser clients (e.g. Vercel web + Render API) need `SameSite=None; Secure`.
 * Same host (reverse proxy or local) keeps `lax`.
 */
export function resolveCookieSameSite(env: Env): CookieSameSite {
  if (env.NODE_ENV !== 'production') {
    return 'lax';
  }
  if (env.COOKIE_SAME_SITE) {
    return env.COOKIE_SAME_SITE;
  }
  const webHost = urlHost(env.WEB_URL);
  const apiHost = urlHost(resolveApiPublicOrigin(env));
  if (!webHost || !apiHost) {
    return 'lax';
  }
  return webHost === apiHost ? 'lax' : 'none';
}

export function cookieSecureFlag(env: Env): boolean {
  const sameSite = resolveCookieSameSite(env);
  if (sameSite === 'none') {
    return true;
  }
  return env.NODE_ENV === 'production';
}