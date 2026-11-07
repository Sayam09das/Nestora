import type { PrismaClient, Role, UserStatus } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import * as argon2 from 'argon2';
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  LockedError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../common/errors/index.js';
import type { Env } from '../../config/env.js';
import { createOpaqueToken } from '../../lib/crypto-token.js';
import * as auditService from '../audit/audit.service.js';
import {
  LOGIN_FAILURE_MAX,
  LOGIN_FAILURE_WINDOW_MS,
  LOGIN_LOCKOUT_MS,
  PRIVILEGED_MFA_ROLES,
} from './auth.constants.js';
import { AuthFlowError } from './auth.errors.js';
import * as repo from './auth.repository.js';
import {
  consumePasswordResetAuth,
  createPasswordResetAuth,
  invalidatePasswordResetOtps,
} from './auth.repository.js';
import * as mailService from './mail.service.js';
import {
  confirmMfaEnrollment,
  consumeRecoveryOrTotp,
  disableMfaForUser,
  startMfaEnrollment,
} from './mfa.service.js';
import { createOtpChallenge, verifyOtpChallenge } from './otp.service.js';
import {
  argon2ParamsFromEnv,
  hashPassword,
  validatePasswordPolicy,
  verifyPassword,
} from './password.service.js';
import {
  createSessionRecord,
  listActiveSessions,
  markSessionMfaVerified,
  revokeAllUserSessions,
  revokeOtherSessions,
  revokeSession,
  revokeSessionByRawToken,
} from './session.service.js';
import {
  clearLoginFailureForIp,
  isIpLoginLocked,
  recordLoginFailureForIp,
} from './throttle.service.js';

const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAA';

async function verifyPasswordAntiEnumeration(
  password: string,
  userHash: string | undefined,
): Promise<boolean> {
  if (!userHash) {
    await verifyPassword(DUMMY_HASH, password);
    return false;
  }
  return verifyPassword(userHash, password);
}

export function mfaEncryptionSecret(env: Env): string {
  return env.MFA_ENCRYPTION_SECRET ?? env.COOKIE_SECRET;
}

function privilegedMfaRequired(env: Env, role: string): boolean {
  return env.PRIVILEGED_MFA_ENFORCED && (PRIVILEGED_MFA_ROLES as readonly string[]).includes(role);
}

function toSessionUser(u: {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  status: UserStatus;
  isVerified: boolean;
  mfaEnabled: boolean;
  hostelAssignments: { hostelId: string }[];
}): SessionUser {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    status: u.status,
    isVerified: u.isVerified,
    mfaEnabled: u.mfaEnabled,
    assignedHostelIds: u.hostelAssignments.map((a) => a.hostelId),
  };
}

/**
 * Public self-signup is not part of MOD-01. Student hostel records are created in MOD-04 by
 * administrators/wardens (FR-010); user accounts are provisioned by admins (FR-006) and activated
 * via email link (FR-005).
 */
export async function register(
  _prisma: PrismaClient,
  _env: Env,
  _input: unknown,
  _ip: string | undefined,
): Promise<void> {
  throw new ForbiddenError(
    'Nestora does not offer public signup. Your University Administrator provisions accounts and sends an activation link to your email.',
  );
}

/** FR-006 + FR-005: University Administrator provisions an account; user activates via email link. */
export async function provisionUser(
  prisma: PrismaClient,
  env: Env,
  actor: { id: string; role: Role },
  input: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: Role;
    hostelId?: string;
  },
  ip: string | undefined,
): Promise<void> {
  const wardenStaffRoles = ['HOSTEL_STAFF', 'SECURITY_GUARD'] as const;

  if (actor.role === 'HOSTEL_WARDEN') {
    if (!(wardenStaffRoles as readonly string[]).includes(input.role)) {
      throw new ForbiddenError(
        'Wardens may only provision Hostel Staff and Security Guard accounts.',
      );
    }
    if (!input.hostelId) {
      throw new BadRequestError(
        'hostelId is required when a Warden provisions staff or guard accounts.',
      );
    }
    const actorRow = await prisma.user.findUnique({
      where: { id: actor.id },
      include: { hostelAssignments: { select: { hostelId: true } } },
    });
    const assigned = actorRow?.hostelAssignments.some((a) => a.hostelId === input.hostelId);
    if (!assigned) {
      throw new ForbiddenError('You can only provision users for hostels you are assigned to.');
    }
  } else if (actor.role !== 'UNIVERSITY_ADMINISTRATOR') {
    throw new ForbiddenError(
      'Only a University Administrator or Hostel Warden can provision accounts.',
    );
  }

  if (input.role === 'UNIVERSITY_ADMINISTRATOR' && actor.role !== 'UNIVERSITY_ADMINISTRATOR') {
    throw new ForbiddenError('You cannot provision University Administrator accounts.');
  }

  if ((wardenStaffRoles as readonly string[]).includes(input.role) && !input.hostelId) {
    throw new BadRequestError('hostelId is required for Hostel Staff and Security Guard accounts.');
  }

  if (input.hostelId) {
    await repo.assertHostelExists(prisma, input.hostelId);
  }

  const email = repo.normalizeEmail(input.email);
  const existing = await repo.findUserByEmail(prisma, email);
  if (existing) {
    throw new BadRequestError('An account with this email already exists.');
  }

  const placeholderHash = await argon2.hash(createOpaqueToken(), argon2ParamsFromEnv(env));

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash: placeholderHash,
        role: input.role,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phoneNumber: input.phoneNumber?.trim() || null,
        status: 'INACTIVE',
        isVerified: false,
      },
    });
    if (input.hostelId) {
      await tx.hostelAssignment.create({
        data: {
          userId: created.id,
          hostelId: input.hostelId,
          assignedBy: actor.id,
        },
      });
    }
    return created;
  });

  const { rawToken } = await repo.issueEmailActionToken(prisma, user.id, 'activation');

  try {
    await mailService.sendAccountActivationLink(env, email, rawToken);
  } catch {
    await prisma.user.delete({ where: { id: user.id } });
    throw new InternalError('Email delivery is not available. Try again later.');
  }

  await auditService.logAuditEvent(prisma, {
    actorUserId: actor.id,
    actorRole: actor.role,
    actionName: 'USER_PROVISIONED',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip ?? null,
  });
}

export async function activateAccount(
  prisma: PrismaClient,
  env: Env,
  input: { token: string; password: string; passwordConfirm: string },
  ip: string | undefined,
): Promise<void> {
  if (input.password !== input.passwordConfirm) {
    throw new BadRequestError('Passwords do not match.');
  }
  validatePasswordPolicy(input.password);

  const consumed = await repo.consumeEmailActionToken(prisma, input.token);
  if (!consumed) {
    throw new AuthFlowError();
  }

  const user = await prisma.user.findUnique({ where: { id: consumed.userId } });
  if (user?.status !== 'INACTIVE' || user?.isVerified) {
    throw new AuthFlowError();
  }

  const passwordHash = await hashPassword(input.password, argon2ParamsFromEnv(env));

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: 'ACTIVE',
        isVerified: true,
      },
    });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: user.id,
      actorRole: user.role,
      actionName: 'ACCOUNT_ACTIVATED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ip ?? null,
    });
  });
}

/** FR-005: re-send activation link for a provisioned but not yet activated account. */
export async function resendAccountActivation(
  prisma: PrismaClient,
  env: Env,
  actor: { id: string; role: Role },
  input: { email: string },
  ip: string | undefined,
): Promise<void> {
  if (actor.role !== 'UNIVERSITY_ADMINISTRATOR') {
    throw new ForbiddenError('Only a University Administrator can resend activation links.');
  }

  const email = repo.normalizeEmail(input.email);
  const user = await repo.findUserByEmail(prisma, email);
  if (user?.status !== 'INACTIVE' || user.isVerified) {
    throw new AuthFlowError();
  }

  const cooled = await repo.passwordResetEmailCooldownReady(prisma, user.id);
  if (!cooled) {
    throw new TooManyRequestsError('Please wait before requesting another activation link.');
  }

  const { rawToken } = await repo.issueEmailActionToken(prisma, user.id, 'activation');

  try {
    await mailService.sendAccountActivationLink(env, email, rawToken);
  } catch {
    throw new InternalError('Email delivery is not available. Try again later.');
  }

  await auditService.logAuditEvent(prisma, {
    actorUserId: actor.id,
    actorRole: actor.role,
    actionName: 'ACTIVATION_LINK_RESENT',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip ?? null,
  });
}

export async function verifyRegistrationOtp(
  _prisma: PrismaClient,
  _env: Env,
  _input: { email: string; code: string },
  _ip: string | undefined,
): Promise<void> {
  throw new ForbiddenError(
    'Nestora does not offer public signup. Your University Administrator provisions accounts and sends an activation link to your email.',
  );
}

export async function resendRegistrationOtp(
  _prisma: PrismaClient,
  _env: Env,
  _input: { email: string },
  _ip: string | undefined,
): Promise<void> {
  throw new ForbiddenError(
    'Nestora does not offer public signup. Ask your administrator to provision your account or resend the activation link.',
  );
}

export type LoginInput = {
  email: string;
  password: string;
  mfaCode?: string;
};

export async function login(
  prisma: PrismaClient,
  env: Env,
  input: LoginInput,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<{ sessionToken: string; user: SessionUser; mfaStep?: 'REQUIRED' }> {
  if (await isIpLoginLocked(prisma, ip)) {
    throw new LockedError('Too many sign-in attempts from this network. Try again later.');
  }

  const normalizedEmail = repo.normalizeEmail(input.email);
  const user = await repo.findUserByEmail(prisma, normalizedEmail);
  const valid = await verifyPasswordAntiEnumeration(input.password, user?.passwordHash);

  const recordFailure = async (actionName = 'LOGIN_FAILED') => {
    await recordLoginFailureForIp(prisma, ip);
    if (user) {
      const now = new Date();
      let failed = user.failedLoginAttempts;
      let windowStart = user.failedAttemptsWindowStartedAt;
      if (!windowStart || now.getTime() - windowStart.getTime() > LOGIN_FAILURE_WINDOW_MS) {
        failed = 1;
        windowStart = now;
      } else {
        failed += 1;
      }
      let lockedUntil: Date | null = user.lockedUntil;
      if (failed >= LOGIN_FAILURE_MAX) {
        lockedUntil = new Date(now.getTime() + LOGIN_LOCKOUT_MS);
        await auditService.logAuditEvent(prisma, {
          actorUserId: user.id,
          actorRole: user.role,
          actionName: 'ACCOUNT_LOCKOUT',
          entityType: 'User',
          entityId: user.id,
          newState: { lockedUntil: lockedUntil.toISOString() },
          ipAddress: ip ?? null,
        });
        failed = 0;
        windowStart = now;
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failed,
          failedAttemptsWindowStartedAt: windowStart,
          lockedUntil,
        },
      });
      await auditService.logAuditEvent(prisma, {
        actorUserId: user.id,
        actorRole: user.role,
        actionName,
        entityType: 'User',
        entityId: user.id,
        ipAddress: ip ?? null,
      });
    }
  };

  if (!user || !valid) {
    await recordFailure();
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new LockedError('Account is temporarily locked. Try again later.');
  }

  if (user.status !== 'ACTIVE') {
    await recordFailure();
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (!user.isVerified) {
    await recordFailure();
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (privilegedMfaRequired(env, user.role) && !user.mfaEnabled) {
    throw new ForbiddenError(
      'Multi-factor authentication must be enabled for your account before you can continue.',
    );
  }

  const needsMfa = user.mfaEnabled || privilegedMfaRequired(env, user.role);
  if (needsMfa) {
    if (!input.mfaCode?.trim()) {
      return {
        sessionToken: '',
        user: toSessionUser(user),
        mfaStep: 'REQUIRED',
      };
    }
    const mfaOk = await consumeRecoveryOrTotp(
      prisma,
      user.id,
      input.mfaCode.trim(),
      mfaEncryptionSecret(env),
    );
    if (!mfaOk) {
      await recordFailure();
      throw new UnauthorizedError('Invalid email or password.');
    }
  }

  await clearLoginFailureForIp(prisma, ip);

  const { rawToken, sessionId } = await createSessionRecord(prisma, {
    userId: user.id,
    ip,
    userAgent,
    env,
    mfaVerified: needsMfa,
  });

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        failedAttemptsWindowStartedAt: null,
        lockedUntil: null,
      },
    });
    await revokeOtherSessions(tx, user.id, sessionId);
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: user.id,
      actorRole: user.role,
      actionName: 'LOGIN_SUCCESS',
      entityType: 'Session',
      entityId: sessionId,
      ipAddress: ip ?? null,
    });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: user.id,
      actorRole: user.role,
      actionName: 'SESSION_CREATED',
      entityType: 'Session',
      entityId: sessionId,
      ipAddress: ip ?? null,
    });
  });

  const refreshed = await repo.findUserByEmail(prisma, normalizedEmail);
  return {
    sessionToken: rawToken,
    user: toSessionUser(refreshed ?? user),
  };
}

export async function logout(
  prisma: PrismaClient,
  rawSessionCookie: string | undefined,
  actorUserId: string | undefined,
  actorRole: string,
  ip: string | undefined,
): Promise<void> {
  await revokeSessionByRawToken(prisma, rawSessionCookie);
  if (actorUserId) {
    await auditService.logAuditEvent(prisma, {
      actorUserId,
      actorRole,
      actionName: 'LOGOUT',
      entityType: 'User',
      entityId: actorUserId,
      ipAddress: ip ?? null,
    });
  }
}

export async function changePassword(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  input: { currentPassword: string; newPassword: string; newPasswordConfirm: string },
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<{ sessionToken: string }> {
  if (input.newPassword !== input.newPasswordConfirm) {
    throw new BadRequestError('Passwords do not match.');
  }
  validatePasswordPolicy(input.newPassword);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { hostelAssignments: { select: { hostelId: true } } },
  });
  const ok = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!ok) {
    throw new UnauthorizedError('Current password is incorrect.');
  }

  const passwordHash = await hashPassword(input.newPassword, argon2ParamsFromEnv(env));

  const { rawToken } = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await revokeAllUserSessions(tx, userId);
    const session = await createSessionRecord(tx, {
      userId,
      ip,
      userAgent,
      env,
      mfaVerified: user.mfaEnabled,
    });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: userId,
      actorRole: user.role,
      actionName: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: userId,
      ipAddress: ip ?? null,
    });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: userId,
      actorRole: user.role,
      actionName: 'SESSION_CREATED',
      entityType: 'Session',
      entityId: session.sessionId,
      ipAddress: ip ?? null,
    });
    return session;
  });

  try {
    await mailService.sendPasswordChangedNotice(env, user.email);
  } catch {
    // non-fatal
  }

  return { sessionToken: rawToken };
}

export async function forgotPassword(
  prisma: PrismaClient,
  env: Env,
  input: { email: string },
  ip: string | undefined,
): Promise<void> {
  const email = repo.normalizeEmail(input.email);
  const user = await repo.findUserByEmail(prisma, email);
  if (user?.status !== 'ACTIVE') {
    await auditService.logAuditEvent(prisma, {
      actorUserId: null,
      actorRole: 'SYSTEM',
      actionName: 'PASSWORD_RESET_REQUESTED',
      entityType: 'User',
      entityId: email,
      ipAddress: ip ?? null,
    });
    return;
  }

  const cooled = await repo.passwordResetEmailCooldownReady(prisma, user.id);
  if (!cooled) {
    return;
  }

  const { rawToken } = await repo.issueEmailActionToken(prisma, user.id, 'password_reset');

  try {
    await mailService.sendPasswordResetLink(env, email, rawToken);
  } catch {
    throw new InternalError('Email delivery is not available. Try again later.');
  }

  await auditService.logAuditEvent(prisma, {
    actorUserId: user.id,
    actorRole: user.role,
    actionName: 'PASSWORD_RESET_LINK_SENT',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip ?? null,
  });
}

export async function verifyForgotPasswordOtp(
  prisma: PrismaClient,
  input: { email: string; code: string },
  ip: string | undefined,
): Promise<{ resetToken: string }> {
  const email = repo.normalizeEmail(input.email);
  const { ok } = await verifyOtpChallenge(prisma, {
    emailNormalized: email,
    purpose: 'PASSWORD_RESET',
    code: input.code,
  });
  if (!ok) {
    throw new AuthFlowError();
  }

  const user = await repo.findUserByEmail(prisma, email);
  if (user?.status !== 'ACTIVE') {
    throw new AuthFlowError();
  }

  const { rawToken } = await prisma.$transaction(async (tx) => {
    return createPasswordResetAuth(tx, user.id);
  });

  await auditService.logAuditEvent(prisma, {
    actorUserId: user.id,
    actorRole: user.role,
    actionName: 'PASSWORD_RESET_OTP_VERIFIED',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip ?? null,
  });

  return { resetToken: rawToken };
}

/** FR-004: reset password using the single-use token from the email link. */
export async function resetPasswordWithEmailLink(
  prisma: PrismaClient,
  env: Env,
  input: { token: string; newPassword: string; newPasswordConfirm: string },
  ip: string | undefined,
): Promise<void> {
  if (input.newPassword !== input.newPasswordConfirm) {
    throw new BadRequestError('Passwords do not match.');
  }
  validatePasswordPolicy(input.newPassword);

  const consumed = await repo.consumeEmailActionToken(prisma, input.token);
  if (!consumed) {
    throw new AuthFlowError();
  }

  const user = await prisma.user.findUnique({ where: { id: consumed.userId } });
  if (user?.status !== 'ACTIVE' || !user?.isVerified) {
    throw new AuthFlowError();
  }

  const passwordHash = await hashPassword(input.newPassword, argon2ParamsFromEnv(env));

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
    await revokeAllUserSessions(tx, user.id);
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: user.id,
      actorRole: user.role,
      actionName: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ip ?? null,
    });
  });

  try {
    await mailService.sendPasswordChangedNotice(env, user.email);
  } catch {
    // non-fatal
  }
}

/** Legacy: OTP step then short-lived reset token (prefer resetPasswordWithEmailLink). */
export async function resetPasswordWithToken(
  prisma: PrismaClient,
  env: Env,
  input: { resetToken: string; newPassword: string; newPasswordConfirm: string; email: string },
  ip: string | undefined,
): Promise<void> {
  if (input.newPassword !== input.newPasswordConfirm) {
    throw new BadRequestError('Passwords do not match.');
  }
  validatePasswordPolicy(input.newPassword);
  const email = repo.normalizeEmail(input.email);
  const user = await repo.findUserByEmail(prisma, email);
  if (!user) {
    throw new AuthFlowError();
  }

  const consumed = await consumePasswordResetAuth(prisma, input.resetToken, user.id);
  if (!consumed) {
    throw new AuthFlowError();
  }

  const passwordHash = await hashPassword(input.newPassword, argon2ParamsFromEnv(env));

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
    await invalidatePasswordResetOtps(tx, email);
    await revokeAllUserSessions(tx, user.id);
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: user.id,
      actorRole: user.role,
      actionName: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ip ?? null,
    });
  });

  try {
    await mailService.sendPasswordChangedNotice(env, user.email);
  } catch {
    // non-fatal
  }
}

export async function requestEmailVerification(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  ip: string | undefined,
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.isVerified) {
    return;
  }

  const email = user.email;
  const gate = await repo.getLatestOtpResendGate(prisma, email, 'EMAIL_VERIFICATION');
  if (gate && gate > new Date()) {
    throw new TooManyRequestsError('Please wait before requesting another code.');
  }

  const { plainCode } = await createOtpChallenge(prisma, {
    emailNormalized: email,
    purpose: 'EMAIL_VERIFICATION',
    userId: user.id,
  });

  try {
    await mailService.sendOtpEmail(env, email, 'EMAIL_VERIFICATION', plainCode);
  } catch {
    throw new InternalError('Email delivery is not available. Try again later.');
  }

  await auditService.logAuditEvent(prisma, {
    actorUserId: user.id,
    actorRole: user.role,
    actionName: 'EMAIL_VERIFICATION_REQUESTED',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip ?? null,
  });
}

export async function completeEmailVerification(
  prisma: PrismaClient,
  userId: string,
  input: { code: string },
  ip: string | undefined,
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { ok } = await verifyOtpChallenge(prisma, {
    emailNormalized: user.email,
    purpose: 'EMAIL_VERIFICATION',
    code: input.code,
  });
  if (!ok) {
    throw new AuthFlowError();
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { isVerified: true } });
    await auditService.logAuditEventInTransaction(tx, {
      actorUserId: userId,
      actorRole: user.role,
      actionName: 'EMAIL_VERIFIED',
      entityType: 'User',
      entityId: userId,
      ipAddress: ip ?? null,
    });
  });
}

export async function listSessionsForUser(prisma: PrismaClient, userId: string) {
  return listActiveSessions(prisma, userId);
}

export async function revokeSessionForUser(
  prisma: PrismaClient,
  userId: string,
  sessionId: string,
  currentSessionId: string | undefined,
  ip: string | undefined,
  actorRole: string,
): Promise<void> {
  if (sessionId === currentSessionId) {
    throw new BadRequestError('Use sign-out to end the current session.');
  }
  const ok = await revokeSession(prisma, sessionId, userId);
  if (!ok) {
    throw new NotFoundError('Session not found.');
  }
  await auditService.logAuditEvent(prisma, {
    actorUserId: userId,
    actorRole,
    actionName: 'SESSION_REVOKED',
    entityType: 'Session',
    entityId: sessionId,
    ipAddress: ip ?? null,
  });
}

export async function revokeAllOtherSessionsForUser(
  prisma: PrismaClient,
  userId: string,
  keepSessionId: string,
  actorRole: string,
  ip: string | undefined,
): Promise<void> {
  await revokeOtherSessions(prisma, userId, keepSessionId);
  await auditService.logAuditEvent(prisma, {
    actorUserId: userId,
    actorRole,
    actionName: 'SESSIONS_REVOKED_OTHERS',
    entityType: 'User',
    entityId: userId,
    ipAddress: ip ?? null,
  });
}

export async function mfaEnrollmentStart(prisma: PrismaClient, env: Env, userId: string) {
  return startMfaEnrollment(prisma, userId, mfaEncryptionSecret(env));
}

export async function mfaEnrollmentConfirm(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  token: string,
  ip: string | undefined,
) {
  await confirmMfaEnrollment(prisma, userId, token, mfaEncryptionSecret(env), ip);
}

export async function mfaVerifyCurrentSession(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  sessionId: string,
  code: string,
): Promise<void> {
  const ok = await consumeRecoveryOrTotp(prisma, userId, code.trim(), mfaEncryptionSecret(env));
  if (!ok) {
    throw new UnauthorizedError('Invalid MFA code.');
  }
  await markSessionMfaVerified(prisma, sessionId, userId);
}

export async function mfaDisable(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  input: { password: string; mfaCode: string },
  ip: string | undefined,
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.mfaEnabled) {
    throw new BadRequestError('MFA is not enabled.');
  }
  const pwOk = await verifyPassword(user.passwordHash, input.password);
  if (!pwOk) {
    throw new UnauthorizedError('Invalid credentials.');
  }
  const mfaOk = await consumeRecoveryOrTotp(
    prisma,
    userId,
    input.mfaCode.trim(),
    mfaEncryptionSecret(env),
  );
  if (!mfaOk) {
    throw new UnauthorizedError('Invalid credentials.');
  }
  await disableMfaForUser(prisma, userId, ip);
  await revokeAllUserSessions(prisma, userId);
}
