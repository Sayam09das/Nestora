import * as argon2 from 'argon2';
import type { Env } from '../../config/env.js';

const MIN_LENGTH = 12;
const MAX_LENGTH = 128;

export type Argon2Params = {
  type: typeof argon2.argon2id;
  memoryCost: number;
  timeCost: number;
  parallelism: number;
};

export function argon2ParamsFromEnv(
  env: Pick<Env, 'ARGON2_MEMORY_COST' | 'ARGON2_TIME_COST' | 'ARGON2_PARALLELISM'>,
): Argon2Params {
  return {
    type: argon2.argon2id,
    memoryCost: env.ARGON2_MEMORY_COST,
    timeCost: env.ARGON2_TIME_COST,
    parallelism: env.ARGON2_PARALLELISM,
  };
}

export function defaultArgon2Params(): Argon2Params {
  return {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  };
}

export function validatePasswordPolicy(plain: string): void {
  if (plain.length < MIN_LENGTH) {
    throw new Error(`Password must be at least ${MIN_LENGTH} characters.`);
  }
  if (plain.length > MAX_LENGTH) {
    throw new Error('Password is too long.');
  }
  const classes = [
    /[a-z]/.test(plain),
    /[A-Z]/.test(plain),
    /\d/.test(plain),
    /[^A-Za-z0-9]/.test(plain),
  ].filter(Boolean).length;
  if (classes < 3) {
    throw new Error(
      'Password must include at least three of: lowercase, uppercase, digit, special character.',
    );
  }
}

export async function hashPassword(
  plain: string,
  params: Argon2Params = defaultArgon2Params(),
): Promise<string> {
  validatePasswordPolicy(plain);
  return argon2.hash(plain, params);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  if (plain.length > MAX_LENGTH) {
    return false;
  }
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export { MAX_LENGTH as PASSWORD_MAX_LENGTH, MIN_LENGTH as PASSWORD_MIN_LENGTH };
