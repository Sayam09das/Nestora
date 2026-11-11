import type { Role } from '@nestora/database';
import {
  dashboardPathForRole,
  ROLE_DASHBOARD_CONTRACT_VERSION,
  ROLE_DASHBOARD_PATH,
} from '@nestora/types';
import {
  activateAccountBodySchema,
  changePasswordBodySchema,
  emailOnlyBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  mfaDisableBodySchema,
  mfaVerifyBodySchema,
  provisionUserBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  resetPasswordLinkBodySchema,
  sessionIdParamsSchema,
  verifyEmailBodySchema,
  verifyPasswordResetOtpBodySchema,
  verifyRegistrationOtpBodySchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { errorResponse, successResponse } from '../../common/api-response.js';
import { isAppError } from '../../common/errors/index.js';
import type { Env } from '../../config/env.js';
import { getSessionCookieName, requireAuth } from '../../middleware/authenticate.js';
import { sessionCookieName } from './auth.constants.js';
import { sessionCookieOptions } from './session-cookie.js';
import { AuthFlowError } from './auth.errors.js';
import * as authService from './auth.service.js';
import { issueCsrfToken } from './csrf.service.js';
import {
  getCurrentSessionRow,
  requireSessionContext,
  sessionContextToUser,
} from './session.service.js';

export async function getCsrfToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const env = request.server.config;
  const token = issueCsrfToken(reply, {
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  reply.send(successResponse({ csrfToken: token }, 'CSRF token issued.'));
}

export async function postRegister(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const env = request.server.config;
  const body = registerBodySchema.parse(request.body);
  await authService.register(request.server.prisma, env, body, request.ip);
  reply.send(successResponse({}, 'Registration is not available.'));
}

export async function postActivateAccount(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const body = activateAccountBodySchema.parse(request.body);
  try {
    await authService.activateAccount(request.server.prisma, env, body, request.ip);
  } catch (err) {
    if (err instanceof AuthFlowError) {
      throw err;
    }
    throw err;
  }
  reply.send(successResponse({}, 'Account activated. You can sign in.'));
}

export async function postProvisionUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const actor = requireAuth(request);
  const body = provisionUserBodySchema.parse(request.body);
  await authService.provisionUser(
    request.server.prisma,
    env,
    { id: actor.id, role: actor.role as Role },
    body,
    request.ip,
  );
  reply.send(
    successResponse(
      {},
      'The user was provisioned. If email delivery succeeded, an activation link was sent.',
    ),
  );
}

export async function postResendAccountActivation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const actor = requireAuth(request);
  const body = emailOnlyBodySchema.parse(request.body);
  try {
    await authService.resendAccountActivation(
      request.server.prisma,
      env,
      { id: actor.id, role: actor.role as Role },
      body,
      request.ip,
    );
  } catch (err) {
    if (err instanceof AuthFlowError) {
      throw err;
    }
    throw err;
  }
  reply.send(successResponse({}, 'If the account is eligible, a new activation link was sent.'));
}

export async function postVerifyRegistrationOtp(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const body = verifyRegistrationOtpBodySchema.parse(request.body);
  await authService.verifyRegistrationOtp(request.server.prisma, env, body, request.ip);
  reply.send(successResponse({ complete: true }, 'Registration complete. You can sign in.'));
}

export async function postResendRegistrationOtp(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const body = emailOnlyBodySchema.parse(request.body);
  await authService.resendRegistrationOtp(request.server.prisma, env, body, request.ip);
  reply.send(successResponse({}, 'If eligible, a new code was sent.'));
}

export async function postLogin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const env = request.server.config;
  const body = loginBodySchema.parse(request.body);
  const result = await authService.login(
    request.server.prisma,
    env,
    body,
    request.ip,
    typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : undefined,
  );

  if (result.mfaStep === 'REQUIRED') {
    reply.send(
      successResponse(
        {
          mfaRequired: true,
          user: {
            email: result.user.email,
            role: result.user.role,
            mustChangePassword: result.user.mustChangePassword,
            dashboardPath: dashboardPathForRole(result.user.role),
          },
        },
        'Enter your multi-factor authentication code.',
      ),
    );
    return;
  }

  const name = sessionCookieName(env.NODE_ENV === 'production');
  reply.setCookie(name, result.sessionToken, sessionCookieOptions(env));
  reply.send(
    successResponse(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isVerified: result.user.isVerified,
          mfaEnabled: result.user.mfaEnabled,
          mustChangePassword: result.user.mustChangePassword,
          dashboardPath: dashboardPathForRole(result.user.role),
        },
      },
      'Signed in successfully.',
    ),
  );
}

export async function getRoleDashboardContract(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  reply.send(
    successResponse(
      {
        version: ROLE_DASHBOARD_CONTRACT_VERSION,
        dashboards: ROLE_DASHBOARD_PATH,
      },
      'Role dashboard redirect contract (FR-002).',
    ),
  );
}

export async function postLogout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const env = request.server.config;
  const name = sessionCookieName(env.NODE_ENV === 'production');
  const raw = request.cookies[name];
  const u = request.user;
  await authService.logout(request.server.prisma, raw, u?.id, u?.role ?? 'SYSTEM', request.ip);
  reply.clearCookie(name, { path: '/' });
  reply.send(successResponse({ loggedOut: true }, 'Signed out successfully.'));
}

export async function getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  reply.send(
    successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          mfaEnabled: user.mfaEnabled,
          mustChangePassword: user.mustChangePassword,
          assignedHostelIds: user.assignedHostelIds,
          dashboardPath: dashboardPathForRole(user.role),
        },
      },
      'Profile loaded.',
    ),
  );
}

export async function getSession(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const ctx = requireSessionContext(request);
  const row = await getCurrentSessionRow(request.server.prisma, ctx.sessionId, ctx.user.id);
  reply.send(
    successResponse(
      {
        session: row,
        user: sessionContextToUser(ctx),
        requiresMfa: ctx.requiresMfa,
      },
      'Session loaded.',
    ),
  );
}

export async function getSessions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = requireAuth(request);
  const sessions = await authService.listSessionsForUser(request.server.prisma, user.id);
  reply.send(successResponse({ sessions }, 'Active sessions.'));
}

export async function deleteSessionById(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  const ctx = request.sessionContext;
  if (!ctx) {
    return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated.', {}));
  }
  const { sessionId } = sessionIdParamsSchema.parse(request.params);
  await authService.revokeSessionForUser(
    request.server.prisma,
    user.id,
    sessionId,
    ctx.sessionId,
    request.ip,
    user.role,
  );
  reply.send(successResponse({}, 'Session revoked.'));
}

export async function postRevokeOtherSessions(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  const ctx = request.sessionContext;
  if (!ctx) {
    return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated.', {}));
  }
  await authService.revokeAllOtherSessionsForUser(
    request.server.prisma,
    user.id,
    ctx.sessionId,
    user.role,
    request.ip,
  );
  reply.send(successResponse({}, 'Other sessions revoked.'));
}

export async function postChangePassword(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const user = requireAuth(request);
  const body = changePasswordBodySchema.parse(request.body);
  const { sessionToken } = await authService.changePassword(
    request.server.prisma,
    env,
    user.id,
    body,
    request.ip,
    typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : undefined,
  );
  const name = sessionCookieName(env.NODE_ENV === 'production');
  reply.setCookie(name, sessionToken, sessionCookieOptions(env));
  reply.send(successResponse({}, 'Password updated.'));
}

export async function postForgotPassword(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const body = forgotPasswordBodySchema.parse(request.body);
  try {
    await authService.forgotPassword(request.server.prisma, env, body, request.ip);
  } catch (err) {
    if (isAppError(err)) {
      throw err;
    }
  }
  reply.send(successResponse({}, 'If an account exists for this email, a reset link was sent.'));
}

export async function postVerifyForgotPasswordOtp(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = verifyPasswordResetOtpBodySchema.parse(request.body);
  let resetToken: string | undefined;
  try {
    const out = await authService.verifyForgotPasswordOtp(request.server.prisma, body, request.ip);
    resetToken = out.resetToken;
  } catch (err) {
    if (!(err instanceof AuthFlowError)) {
      throw err;
    }
  }
  reply.send(
    successResponse(
      resetToken ? { resetToken } : {},
      'If the code was valid, use the issued reset token to set a new password.',
    ),
  );
}

export async function postResetPassword(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const body = resetPasswordBodySchema.parse(request.body);
  try {
    await authService.resetPasswordWithToken(request.server.prisma, env, body, request.ip);
  } catch (err) {
    if (!(err instanceof AuthFlowError)) {
      throw err;
    }
  }
  reply.send(
    successResponse({}, 'If the reset was valid, your password is updated. You can sign in.'),
  );
}

export async function postResetPasswordWithLink(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const body = resetPasswordLinkBodySchema.parse(request.body);
  try {
    await authService.resetPasswordWithEmailLink(request.server.prisma, env, body, request.ip);
  } catch (err) {
    if (!(err instanceof AuthFlowError)) {
      throw err;
    }
  }
  reply.send(
    successResponse({}, 'If the reset link was valid, your password is updated. You can sign in.'),
  );
}

export async function postRequestEmailVerification(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const ctx = requireSessionContext(request);
  await authService.requestEmailVerification(request.server.prisma, env, ctx.user.id, request.ip);
  reply.send(successResponse({}, 'If needed, a verification code was sent.'));
}

export async function postCompleteEmailVerification(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const ctx = requireSessionContext(request);
  const body = verifyEmailBodySchema.parse(request.body);
  await authService.completeEmailVerification(request.server.prisma, ctx.user.id, body, request.ip);
  reply.send(successResponse({}, 'Email verified.'));
}

export async function postMfaEnrollmentStart(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const user = requireAuth(request);
  const out = await authService.mfaEnrollmentStart(request.server.prisma, env, user.id);
  reply.send(
    successResponse(
      {
        secret: out.secret,
        otpauthUrl: out.otpauthUrl,
        recoveryCodes: out.recoveryCodes,
      },
      'Save your recovery codes. MFA activation requires a valid TOTP.',
    ),
  );
}

export async function postMfaEnrollmentConfirm(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const user = requireAuth(request);
  const body = mfaVerifyBodySchema.parse(request.body);
  await authService.mfaEnrollmentConfirm(
    request.server.prisma,
    env,
    user.id,
    body.code,
    request.ip,
  );
  reply.send(successResponse({}, 'MFA enabled.'));
}

export async function postMfaVerifySession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = request.server.config;
  const ctx = requireSessionContext(request);
  const body = mfaVerifyBodySchema.parse(request.body);
  await authService.mfaVerifyCurrentSession(
    request.server.prisma,
    env,
    ctx.user.id,
    ctx.sessionId,
    body.code,
  );
  reply.send(
    successResponse(
      {
        dashboardPath: dashboardPathForRole(ctx.user.role),
      },
      'MFA verified for this session.',
    ),
  );
}

export async function postMfaDisable(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const env = request.server.config;
  const user = requireAuth(request);
  const body = mfaDisableBodySchema.parse(request.body);
  await authService.mfaDisable(request.server.prisma, env, user.id, body, request.ip);
  const name = getSessionCookieName(env.NODE_ENV === 'production');
  reply.clearCookie(name, { path: '/' });
  reply.send(successResponse({}, 'MFA disabled. Sign in again.'));
}
