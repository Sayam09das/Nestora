import { dashboardPathForRole } from '@nestora/types';
import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

const AUTH_PREFIX = '/api/v1/auth';

export type AuthUserPayload = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  mfaEnabled: boolean;
  mustChangePassword?: boolean;
  assignedHostelIds?: string[];
  dashboardPath: string;
};

export type LoginResult =
  | { kind: 'success'; user: AuthUserPayload; message: string }
  | { kind: 'mfa_required'; user: Pick<AuthUserPayload, 'email' | 'role' | 'dashboardPath'>; message: string }
  | { kind: 'error'; message: string; code?: string };

export async function loginWithPassword(
  email: string,
  password: string,
  mfaCode?: string,
): Promise<LoginResult> {
  const response = await apiFetch(`${AUTH_PREFIX}/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      password,
      ...(mfaCode?.trim() ? { mfaCode: mfaCode.trim() } : {}),
    }),
  });
  const parsed = await parseApiResponse<{
    mfaRequired?: boolean;
    user?: AuthUserPayload;
  }>(response);

  if (!parsed.ok) {
    return { kind: 'error', message: parsed.message, code: parsed.code };
  }

  if (parsed.data.mfaRequired && parsed.data.user) {
    return {
      kind: 'mfa_required',
      user: parsed.data.user,
      message: parsed.message,
    };
  }

  if (!parsed.data.user) {
    return { kind: 'error', message: 'Sign-in response was incomplete.' };
  }

  const user = parsed.data.user;
  return {
    kind: 'success',
    user: {
      ...user,
      dashboardPath: user.dashboardPath ?? dashboardPathForRole(user.role),
    },
    message: parsed.message,
  };
}

export async function fetchCurrentUser(): Promise<{
  user?: AuthUserPayload;
  error?: string;
  status: number;
}> {
  const response = await apiFetch(`${AUTH_PREFIX}/me`);
  const parsed = await parseApiResponse<{ user: AuthUserPayload }>(response);
  if (!parsed.ok) {
    return { error: parsed.message, status: response.status };
  }
  const user = parsed.data.user;
  return {
    user: {
      ...user,
      dashboardPath: user.dashboardPath ?? dashboardPathForRole(user.role),
    },
    status: response.status,
  };
}

export async function logout(): Promise<{ ok: boolean; message: string }> {
  const response = await apiFetchMutating(`${AUTH_PREFIX}/logout`, { method: 'POST' });
  const parsed = await parseApiResponse<{ loggedOut: boolean }>(response);
  return { ok: parsed.ok, message: parsed.ok ? parsed.message : parsed.message };
}

export async function activateAccount(payload: {
  token: string;
  password: string;
  passwordConfirm: string;
}): Promise<{ ok: boolean; message: string }> {
  const response = await apiFetch(`${AUTH_PREFIX}/activate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<Record<string, never>>(response);
  return { ok: parsed.ok, message: parsed.message };
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}): Promise<{ ok: boolean; message: string }> {
  const response = await apiFetchMutating(`${AUTH_PREFIX}/password/change`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<Record<string, never>>(response);
  return { ok: parsed.ok, message: parsed.message };
}

export function postLoginRedirect(user: Pick<AuthUserPayload, 'dashboardPath' | 'mustChangePassword'>): string {
  if (user.mustChangePassword) {
    return '/change-password';
  }
  return user.dashboardPath || '/login';
}
