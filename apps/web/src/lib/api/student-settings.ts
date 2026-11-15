import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentSettingsDesk = {
  generatedAt: string;
  security: {
    mfaEnabled: boolean;
    isVerified: boolean;
    mustChangePassword: boolean;
    email: string;
    phone: string | null;
  };
  notifications: {
    emailLeaves: boolean;
    emailMaintenance: boolean;
    emailFees: boolean;
    emailNotices: boolean;
  };
  residence: {
    hostelName: string | null;
    roomNumber: string | null;
    bedNumber: string | null;
  };
  activity: {
    activeSessions: number;
  };
};

export type StudentSettingsSession = {
  id: string;
  createdAt: string;
  lastActivityAt: string | null;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

export async function fetchStudentSettingsDesk(): Promise<{
  desk?: StudentSettingsDesk;
  sessions?: StudentSettingsSession[];
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/settings');
  const parsed = await parseApiResponse<{ desk: StudentSettingsDesk; sessions: StudentSettingsSession[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk, sessions: parsed.data.sessions };
}

export async function patchStudentNotificationPreferences(
  input: Partial<StudentSettingsDesk['notifications']>,
): Promise<{
  notifications?: StudentSettingsDesk['notifications'];
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  const parsed = await parseApiResponse<{ notifications: StudentSettingsDesk['notifications'] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { notifications: parsed.data.notifications };
}

export async function revokeStudentOtherSessions(): Promise<{ error?: string }> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/settings/sessions/revoke-others', {
    method: 'POST',
  });
  const parsed = await parseApiResponse<{ revoked: boolean }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}