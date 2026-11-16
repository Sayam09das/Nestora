import { describe, expect, it } from 'vitest';
import type { Env } from './env.js';
import { resolveApiPublicOrigin, resolveCookieSameSite } from './cookie-same-site.js';

const base = {
  NODE_ENV: 'production',
  PORT: 4000,
  HOST: '0.0.0.0',
  WEB_URL: 'https://nestora.vercel.app',
  CORS_ORIGIN: 'https://nestora.vercel.app',
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  COOKIE_SECRET: 'x'.repeat(32),
  MFA_ENCRYPTION_SECRET: 'y'.repeat(32),
} as Env;

describe('resolveCookieSameSite', () => {
  it('uses lax when web and API share the same host', () => {
    const env = { ...base, API_URL: 'https://nestora.vercel.app' };
    expect(resolveCookieSameSite(env)).toBe('lax');
  });

  it('uses none when web and API hosts differ (Vercel + Render)', () => {
    const env = { ...base, API_URL: 'https://nestora-api.onrender.com' };
    expect(resolveCookieSameSite(env)).toBe('none');
  });

  it('honours explicit COOKIE_SAME_SITE in production', () => {
    const env = { ...base, API_URL: 'https://nestora.vercel.app', COOKIE_SAME_SITE: 'none' as const };
    expect(resolveCookieSameSite(env)).toBe('none');
  });

  it('stays lax in development even when hosts differ', () => {
    const env = {
      ...base,
      NODE_ENV: 'development',
      API_URL: 'https://nestora-api.onrender.com',
    } as Env;
    expect(resolveCookieSameSite(env)).toBe('lax');
  });
});

describe('resolveApiPublicOrigin', () => {
  it('falls back to localhost when API_URL is unset', () => {
    const env = { ...base, API_URL: undefined } as Env;
    expect(resolveApiPublicOrigin(env)).toBe('http://localhost:4000');
  });
});