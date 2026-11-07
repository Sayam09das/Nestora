import type { FastifyRequest } from 'fastify';
import type { SessionUser } from '@nestora/types';
import { describe, expect, it } from 'vitest';
import { MustChangePasswordError } from '../common/errors/index.js';
import { enforcePasswordChangeGate } from './password-change-gate.js';

function fakeRequest(path: string, user?: Partial<SessionUser>): FastifyRequest {
  return {
    url: path,
    user: user
      ? ({
          id: 'u1',
          email: 'a@b.test',
          role: 'STUDENT',
          mustChangePassword: true,
          ...user,
        } as SessionUser)
      : undefined,
  } as FastifyRequest;
}

describe('enforcePasswordChangeGate', () => {
  it('allows password change when flag is set', () => {
    expect(() =>
      enforcePasswordChangeGate(
        fakeRequest('/api/v1/auth/password/change', { mustChangePassword: true }),
      ),
    ).not.toThrow();
  });

  it('blocks infrastructure when flag is set', () => {
    expect(() =>
      enforcePasswordChangeGate(
        fakeRequest('/api/v1/infrastructure/hostels', { mustChangePassword: true }),
      ),
    ).toThrow(MustChangePasswordError);
  });

  it('ignores users without the flag', () => {
    expect(() =>
      enforcePasswordChangeGate(
        fakeRequest('/api/v1/infrastructure/hostels', { mustChangePassword: false }),
      ),
    ).not.toThrow();
  });
});
