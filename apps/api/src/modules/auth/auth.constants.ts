export const SESSION_COOKIE_NAME = '__Host-nestora_session';
export const SESSION_COOKIE_NAME_DEV = 'nestora_session';
export const CSRF_COOKIE_NAME = 'nestora_csrf';

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const RESET_AUTH_TTL_MINUTES = 15;

/** FR-005 / docs: activation links for provisioned accounts (e.g. 24h). */
export const ACTIVATION_TOKEN_TTL_HOURS = 24;

/** FR-004 / architecture: password reset links (15 minutes). */
export const PASSWORD_RESET_LINK_TTL_MINUTES = 15;

export const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_FAILURE_MAX = 5;
export const LOGIN_LOCKOUT_MS = 30 * 60 * 1000;

export const IP_LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const IP_LOGIN_FAILURE_MAX = 50;
export const IP_LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

export const PRIVILEGED_MFA_ROLES = ['UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT'] as const;

export function sessionCookieName(isProduction: boolean): string {
  return isProduction ? SESSION_COOKIE_NAME : SESSION_COOKIE_NAME_DEV;
}
