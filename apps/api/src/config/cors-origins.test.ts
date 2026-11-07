import { describe, expect, it } from 'vitest';
import { envSchema } from './schema.js';
import { getAllowedCorsOrigins, isAllowedOrigin } from './cors-origins.js';

function env(overrides: Record<string, string> = {}) {
  return envSchema.parse({
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    COOKIE_SECRET: 'change_me_to_a_32_byte_secure_random_string',
    ...overrides,
  });
}

describe('cors-origins', () => {
  it('merges primary and comma list', () => {
    const e = env({
      CORS_ORIGIN: 'http://localhost:3000',
      CORS_ORIGINS: 'http://localhost:3001,http://localhost:3000',
    });
    expect(getAllowedCorsOrigins(e)).toEqual(
      expect.arrayContaining(['http://localhost:3000', 'http://localhost:3001']),
    );
    expect(getAllowedCorsOrigins(e).length).toBe(2);
  });

  it('isAllowedOrigin matches allowlist', () => {
    const e = env({ CORS_ORIGIN: 'http://app.local:3000' });
    expect(isAllowedOrigin(e, 'http://app.local:3000')).toBe(true);
    expect(isAllowedOrigin(e, 'http://evil.local')).toBe(false);
  });
});
