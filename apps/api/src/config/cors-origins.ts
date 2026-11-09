import type { Env } from './env.js';

/**
 * Credentialed CORS allowlist. Always includes `CORS_ORIGIN`; merge `CORS_ORIGINS` when set.
 */
export function getAllowedCorsOrigins(env: Env): string[] {
  const primary = env.CORS_ORIGIN.trim();
  const extra = env.CORS_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const combined = [primary, ...(extra ?? [])];
  return [...new Set(combined)];
}

export function isAllowedOrigin(env: Env, origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }
  const allowed = new Set(getAllowedCorsOrigins(env));
  return allowed.has(origin);
}
