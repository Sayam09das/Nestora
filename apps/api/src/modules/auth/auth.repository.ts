import type { OtpPurpose, PrismaClient, Role } from '@nestora/database';
import { ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { createOpaqueToken, sha256Hex } from '../../lib/crypto-token.js';
import {
  ACTIVATION_TOKEN_TTL_HOURS,
  OTP_RESEND_COOLDOWN_SECONDS,
  PASSWORD_RESET_LINK_TTL_MINUTES,
  RESET_AUTH_TTL_MINUTES,
} from './auth.constants.js';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { hostelAssignments: { select: { hostelId: true } } },
  });
}

export async function assertHostelExists(prisma: PrismaClient, hostelId: string): Promise<void> {
  const hostel = await prisma.hostel.findUnique({
    where: { id: hostelId },
    select: { id: true },
  });
  if (!hostel) {
    throw new NotFoundError('Hostel not found.');
  }
}

export async function findPendingByEmail(prisma: PrismaClient, email: string) {
  return prisma.pendingRegistration.findUnique({ where: { email } });
}

export async function createPasswordResetAuth(
  prisma: Pick<PrismaClient, 'passwordResetAuthorization'>,
  userId: string,
): Promise<{ rawToken: string }> {
  const rawToken = createOpaqueToken();
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + RESET_AUTH_TTL_MINUTES * 60 * 1000);
  const now = new Date();
  await prisma.passwordResetAuthorization.updateMany({
    where: { userId, consumedAt: null },
    data: { consumedAt: now },
  });
  await prisma.passwordResetAuthorization.create({
    data: { userId, tokenHash, expiresAt },
  });
  return { rawToken };
}

export async function consumePasswordResetAuth(
  prisma: PrismaClient,
  rawToken: string,
  userId: string,
): Promise<boolean> {
  const tokenHash = sha256Hex(rawToken);
  const now = new Date();
  const res = await prisma.passwordResetAuthorization.updateMany({
    where: {
      userId,
      tokenHash,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    data: { consumedAt: now },
  });
  return res.count > 0;
}

export async function invalidatePasswordResetOtps(
  prisma: PrismaClient | Pick<PrismaClient, 'otpChallenge'>,
  emailNormalized: string,
): Promise<void> {
  await prisma.otpChallenge.updateMany({
    where: {
      emailNormalized,
      purpose: 'PASSWORD_RESET',
      consumedAt: null,
    },
    data: { consumedAt: new Date() },
  });
}

export async function getLatestOtpResendGate(
  prisma: PrismaClient,
  emailNormalized: string,
  purpose: OtpPurpose,
): Promise<Date | null> {
  const row = await prisma.otpChallenge.findFirst({
    where: { emailNormalized, purpose },
    orderBy: { createdAt: 'desc' },
    select: { resendNotBefore: true },
  });
  return row?.resendNotBefore ?? null;
}

export function assertRegistrationRoleAllowed(role: Role): void {
  if (role === 'UNIVERSITY_ADMINISTRATOR') {
    throw new ForbiddenError('You cannot register with this role.');
  }
}

export async function issueEmailActionToken(
  prisma: Pick<PrismaClient, 'passwordResetToken'>,
  userId: string,
  purpose: 'activation' | 'password_reset',
): Promise<{ rawToken: string }> {
  const rawToken = createOpaqueToken();
  const tokenHash = sha256Hex(rawToken);
  const ttlMinutes =
    purpose === 'activation' ? ACTIVATION_TOKEN_TTL_HOURS * 60 : PASSWORD_RESET_LINK_TTL_MINUTES;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  await prisma.passwordResetToken.updateMany({
    where: { userId, isUsed: false },
    data: { isUsed: true },
  });
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });
  return { rawToken };
}

export async function passwordResetEmailCooldownReady(
  prisma: PrismaClient,
  userId: string,
): Promise<boolean> {
  const row = await prisma.passwordResetToken.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  if (!row) {
    return true;
  }
  const notBefore = row.createdAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
  return Date.now() >= notBefore;
}

export async function consumeEmailActionToken(
  prisma: PrismaClient,
  rawToken: string,
): Promise<{ userId: string } | null> {
  const tokenHash = sha256Hex(rawToken);
  const now = new Date();
  const row = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, isUsed: false, expiresAt: { gt: now } },
    select: { id: true, userId: true },
  });
  if (!row) {
    return null;
  }
  const updated = await prisma.passwordResetToken.updateMany({
    where: { id: row.id, isUsed: false, expiresAt: { gt: now } },
    data: { isUsed: true },
  });
  return updated.count > 0 ? { userId: row.userId } : null;
}
