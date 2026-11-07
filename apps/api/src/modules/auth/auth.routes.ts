import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAdminAuthActivity,
  getAdminUserById,
  getAdminUsers,
  patchAdminUserRole,
  patchAdminUserStatus,
  postAdminRevokeUserSessions,
  postAdminSetTemporaryPassword,
} from './admin-user.controller.js';
import {
  deleteSessionById,
  getCsrfToken,
  getMe,
  getRoleDashboardContract,
  getSession,
  getSessions,
  postActivateAccount,
  postChangePassword,
  postCompleteEmailVerification,
  postForgotPassword,
  postLogin,
  postLogout,
  postMfaDisable,
  postMfaEnrollmentConfirm,
  postMfaEnrollmentStart,
  postMfaVerifySession,
  postProvisionUser,
  postRegister,
  postRequestEmailVerification,
  postResendAccountActivation,
  postResendRegistrationOtp,
  postResetPassword,
  postResetPasswordWithLink,
  postRevokeOtherSessions,
  postVerifyForgotPasswordOtp,
  postVerifyRegistrationOtp,
} from './auth.controller.js';

const adminOnly = {
  preHandler: [
    async (request: FastifyRequest) => {
      requireAuth(request);
    },
    requireRoles('UNIVERSITY_ADMINISTRATOR'),
  ],
};

function authSensitiveRateLimit(app: FastifyInstance) {
  return {
    rateLimit: {
      max: app.config.RATE_LIMIT_AUTH_MAX,
      timeWindow: '1 minute',
    },
  };
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  const sensitiveRateLimit = authSensitiveRateLimit(app);
  app.get('/csrf-token', getCsrfToken);
  app.get('/role-dashboards', getRoleDashboardContract);

  app.get('/admin/auth-activity', adminOnly, getAdminAuthActivity);
  app.get('/admin/users', adminOnly, getAdminUsers);
  app.get('/admin/users/:userId', adminOnly, getAdminUserById);
  app.patch('/admin/users/:userId/status', adminOnly, patchAdminUserStatus);
  app.patch('/admin/users/:userId/role', adminOnly, patchAdminUserRole);
  app.post('/admin/users/:userId/revoke-sessions', adminOnly, postAdminRevokeUserSessions);
  app.post(
    '/admin/users/:userId/temporary-password',
    adminOnly,
    postAdminSetTemporaryPassword,
  );

  app.post('/register', postRegister);
  app.post('/register/verify-otp', postVerifyRegistrationOtp);
  app.post('/register/resend-otp', postResendRegistrationOtp);
  app.post('/activate', { config: sensitiveRateLimit }, postActivateAccount);
  app.post(
    '/users/provision',
    {
      preHandler: [
        async (request) => {
          requireAuth(request);
        },
        requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN'),
      ],
    },
    postProvisionUser,
  );
  app.post(
    '/users/resend-activation',
    {
      preHandler: [
        async (request) => {
          requireAuth(request);
        },
        requireRoles('UNIVERSITY_ADMINISTRATOR'),
      ],
    },
    postResendAccountActivation,
  );

  app.post('/login', { config: sensitiveRateLimit }, postLogin);
  app.post('/logout', postLogout);

  app.get('/me', getMe);
  app.get('/session', getSession);

  app.get('/sessions', getSessions);
  app.delete('/sessions/:sessionId', deleteSessionById);
  app.post('/sessions/revoke-others', postRevokeOtherSessions);

  app.post('/password/change', postChangePassword);
  app.post('/password/forgot', { config: sensitiveRateLimit }, postForgotPassword);
  app.post('/password/verify-otp', { config: sensitiveRateLimit }, postVerifyForgotPasswordOtp);
  app.post('/password/reset', { config: sensitiveRateLimit }, postResetPassword);
  app.post('/password/reset-with-link', { config: sensitiveRateLimit }, postResetPasswordWithLink);

  app.post('/email/verify-request', postRequestEmailVerification);
  app.post('/email/verify-complete', postCompleteEmailVerification);

  app.post(
    '/mfa/enrollment/start',
    { preHandler: requireRoles('UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT') },
    postMfaEnrollmentStart,
  );
  app.post(
    '/mfa/enrollment/confirm',
    { preHandler: requireRoles('UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT') },
    postMfaEnrollmentConfirm,
  );
  app.post('/mfa/verify-session', postMfaVerifySession);
  app.post(
    '/mfa/disable',
    { preHandler: requireRoles('UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT') },
    postMfaDisable,
  );
};
