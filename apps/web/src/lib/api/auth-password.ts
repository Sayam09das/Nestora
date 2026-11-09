import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

const AUTH_PREFIX = '/api/v1/auth';

type LegacyEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function readEnvelope<T>(response: Response): Promise<LegacyEnvelope<T>> {
  const parsed = await parseApiResponse<T>(response);
  if (parsed.ok) {
    return { success: true, message: parsed.message, data: parsed.data };
  }
  return { success: false, message: parsed.message, data: undefined };
}

export async function requestPasswordReset(email: string) {
  const response = await apiFetch(`${AUTH_PREFIX}/password/forgot`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return readEnvelope<Record<string, never>>(response);
}

export async function verifyPasswordResetOtp(email: string, code: string) {
  const response = await apiFetch(`${AUTH_PREFIX}/password/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
  return readEnvelope<{ resetToken?: string }>(response);
}

export async function resetPasswordWithToken(payload: {
  email: string;
  resetToken: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const response = await apiFetch(`${AUTH_PREFIX}/password/reset`, {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      resetToken: payload.resetToken,
      newPassword: payload.newPassword,
      newPasswordConfirm: payload.newPasswordConfirm,
    }),
  });
  return readEnvelope<Record<string, never>>(response);
}

export async function resetPasswordWithEmailLink(payload: {
  token: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const response = await apiFetch(`${AUTH_PREFIX}/password/reset-with-link`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return readEnvelope<Record<string, never>>(response);
}

export const passwordResetStorage = {
  emailKey: 'nestora_pw_reset_email',
  tokenKey: 'nestora_pw_reset_token',
} as const;
