import { randomInt } from 'node:crypto';
import type { OtpPurpose, PrismaClient } from '@nestora/database';
import { sha256Hex } from '../../lib/crypto-token.js';
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_MINUTES,
} from './auth.constants.js';

export function generateOtpDigits(): string {
  const max = 10 ** OTP_LENGTH;
  return randomInt(0, max).toString().padStart(OTP_LENGTH, '0');
}

export function hashOtpCode(code: string): string {
  return sha256Hex(code.trim());
}

export async function createOtpChallenge(
  prisma: PrismaClient,
  input: {
    emailNormalized: string;
    purpose: OtpPurpose;
    userId?: string | null;
  },
): Promise<{ id: string; plainCode: string; expiresAt: Date }> {
  const plainCode = generateOtpDigits();
  const codeHash = hashOtpCode(plainCode);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  const resendNotBefore = new Date(Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000);

  const row = await prisma.$transaction(async (tx) => {
    await tx.otpChallenge.updateMany({
      where: {
        emailNormalized: input.emailNormalized,
        purpose: input.purpose,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    return tx.otpChallenge.create({
      data: {
        emailNormalized: input.emailNormalized,
        purpose: input.purpose,
        codeHash,
        expiresAt,
        resendNotBefore,
        userId: input.userId ?? null,
        attemptCount: 0,
      },
    });
  });

  return { id: row.id, plainCode, expiresAt };
}

export async function verifyOtpChallenge(
  prisma: PrismaClient,
  input: {
    emailNormalized: string;
    purpose: OtpPurpose;
    code: string;
  },
): Promise<{ ok: boolean }> {
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      emailNormalized: input.emailNormalized,
      purpose: input.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) {
    return { ok: false };
  }

  const now = new Date();
  if (challenge.expiresAt <= now) {
    return { ok: false };
  }

  if (challenge.attemptCount >= OTP_MAX_ATTEMPTS) {
    return { ok: false };
  }

  const codeHash = hashOtpCode(input.code);
  const match = timingSafeEqualHex(codeHash, challenge.codeHash);

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { attemptCount: { increment: 1 } },
  });

  if (!match) {
    return { ok: false };
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: now },
  });

  return { ok: true };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    const ac = a.charCodeAt(i);
    const bc = b.charCodeAt(i);
    if (ac === undefined || bc === undefined) {
      return false;
    }
    out |= ac ^ bc;
  }
  return out === 0;
}
