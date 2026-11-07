/** FR-009: authentication events persisted via the audit log. */
export const AUTH_ACTIVITY_ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT',
  'SESSION_CREATED',
  'SESSION_REVOKED',
  'SESSIONS_REVOKED_OTHERS',
  'USER_SESSIONS_REVOKED_BY_ADMIN',
  'ACCOUNT_ACTIVATED',
  'PASSWORD_RESET_COMPLETED',
  'USER_PROVISIONED',
  'USER_STATUS_CHANGED',
  'USER_ROLE_CHANGED',
] as const;

export type AuthActivityAction = (typeof AUTH_ACTIVITY_ACTIONS)[number];
