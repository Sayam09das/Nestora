import { describe, expect, it } from 'vitest';
import { hashPassword, validatePasswordPolicy, verifyPassword } from './password.service.js';

describe('password.service', () => {
  it('validatePasswordPolicy rejects short passwords', () => {
    expect(() => validatePasswordPolicy('short')).toThrow();
  });

  it('hash and verify round-trip', async () => {
    const plain = 'Abcd1234!Abcd1234';
    const hash = await hashPassword(plain);
    expect(hash).not.toContain(plain);
    expect(await verifyPassword(hash, plain)).toBe(true);
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });
});
