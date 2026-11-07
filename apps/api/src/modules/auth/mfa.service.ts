import { randomInt } from 'node:crypto';
import type { PrismaClient } from '@nestora/database';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { BadRequestError } from '../../common/errors/index.js';
import { sha256Hex } from '../../lib/crypto-token.js';
import * as auditService from '../audit/audit.service.js';
import { decryptWithSecret, encryptWithSecret } from './crypto-secret.js';

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpProvisioningUri(email: string, secret: string): string {
  return generateURI({ issuer: 'Nestora', label: email, secret });
}

export function verifyTotpToken(secret: string, token: string): boolean {
  const result = verifySync({
    secret,
    token,
    epochTolerance: 30,
  }) as { valid?: boolean };
  return result.valid === true;
}

export function generateRecoveryCodePlain(): string {
  return randomInt(0, 1_000_000_000).toString().padStart(9, '0');
}

export async function startMfaEnrollment(
  prisma: PrismaClient,
  userId: string,
  encryptionSecret: string,
): Promise<{ secret: string; otpauthUrl: string; recoveryCodes: string[] }> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const secret = generateTotpSecret();
  const enc = encryptWithSecret(secret, encryptionSecret);
  const recoveryPlain: string[] = [];
  const recoveryHashes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const c = generateRecoveryCodePlain();
    recoveryPlain.push(c);
    recoveryHashes.push(sha256Hex(c));
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { mfaSecretEnc: enc },
    });
    await tx.mfaRecoveryCode.deleteMany({ where: { userId } });
    for (const h of recoveryHashes) {
      await tx.mfaRecoveryCode.create({ data: { userId, codeHash: h } });
    }
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: userId,
      actorRole: user.role,
      actionName: 'MFA_ENROLLMENT_STARTED',
      entityType: 'User',
      entityId: userId,
      newState: { recoveryCodeCount: recoveryHashes.length },
      ipAddress: null,
    });
  });
  return {
    secret,
    otpauthUrl: totpProvisioningUri(user.email, secret),
    recoveryCodes: recoveryPlain,
  };
}

export async function confirmMfaEnrollment(
  prisma: PrismaClient,
  userId: string,
  token: string,
  encryptionSecret: string,
  ip: string | undefined,
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.mfaSecretEnc) {
    throw new BadRequestError('MFA enrollment not started.');
  }
  const secret = decryptWithSecret(user.mfaSecretEnc, encryptionSecret);
  if (!verifyTotpToken(secret, token)) {
    throw new BadRequestError('Invalid MFA code.');
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: userId,
      actorRole: user.role,
      actionName: 'MFA_ENABLED',
      entityType: 'User',
      entityId: userId,
      ipAddress: ip ?? null,
    });
  });
}

export async function verifyMfaDuringLogin(
  prisma: PrismaClient,
  userId: string,
  token: string,
  encryptionSecret: string,
): Promise<boolean> {
  return consumeRecoveryOrTotp(prisma, userId, token, encryptionSecret);
}

export async function consumeRecoveryOrTotp(
  prisma: PrismaClient,
  userId: string,
  token: string,
  encryptionSecret: string,
): Promise<boolean> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.mfaSecretEnc) {
    return false;
  }
  const secret = decryptWithSecret(user.mfaSecretEnc, encryptionSecret);
  if (verifyTotpToken(secret, token)) {
    return true;
  }
  return consumeRecoveryCode(prisma, userId, token);
}

async function consumeRecoveryCode(
  prisma: PrismaClient,
  userId: string,
  code: string,
): Promise<boolean> {
  const hash = sha256Hex(code.trim());
  const row = await prisma.mfaRecoveryCode.findFirst({
    where: { userId, codeHash: hash, usedAt: null },
  });
  if (!row) {
    return false;
  }
  await prisma.mfaRecoveryCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return true;
}

export async function disableMfaForUser(
  prisma: PrismaClient,
  userId: string,
  ip: string | undefined,
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecretEnc: null },
    });
    await tx.mfaRecoveryCode.deleteMany({ where: { userId } });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: userId,
      actorRole: user.role,
      actionName: 'MFA_DISABLED',
      entityType: 'User',
      entityId: userId,
      ipAddress: ip ?? null,
    });
  });
}
