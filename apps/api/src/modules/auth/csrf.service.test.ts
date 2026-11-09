import { describe, expect, it } from 'vitest';
import { issueCsrfToken, verifyCsrfHeader } from './csrf.service.js';

describe('verifyCsrfHeader', () => {
  it('rejects missing header or cookie', () => {
    expect(verifyCsrfHeader(undefined, 'a')).toBe(false);
    expect(verifyCsrfHeader('a', undefined)).toBe(false);
  });

  it('accepts equal-length matching tokens', () => {
    const t = 'a'.repeat(64);
    expect(verifyCsrfHeader(t, t)).toBe(true);
  });

  it('rejects different tokens', () => {
    const a = 'a'.repeat(64);
    const b = 'b'.repeat(64);
    expect(verifyCsrfHeader(a, b)).toBe(false);
  });
});

describe('issueCsrfToken', () => {
  it('sets cookie and returns token', () => {
    const calls: { name: string; value: string; opts: Record<string, unknown> }[] = [];
    const reply = {
      setCookie: (name: string, value: string, opts: Record<string, unknown>) => {
        calls.push({ name, value, opts });
      },
    };
    const token = issueCsrfToken(reply, { secure: false, sameSite: 'lax' });
    expect(token.length).toBeGreaterThan(10);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.name).toBe('nestora_csrf');
    expect(calls[0]?.value).toBe(token);
  });
});
