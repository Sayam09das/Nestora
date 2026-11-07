import { describe, expect, it } from 'vitest';
import { createOpaqueToken, sha256Hex } from './crypto-token.js';

describe('crypto-token', () => {
  it('createOpaqueToken returns 64 hex chars (32 bytes)', () => {
    const t = createOpaqueToken();
    expect(t).toMatch(/^[0-9a-f]{64}$/);
  });

  it('sha256Hex is stable for same input', () => {
    expect(sha256Hex('hello')).toBe(sha256Hex('hello'));
  });
});
