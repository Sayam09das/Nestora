import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { AdminStaffProfile } from '@/lib/api/staff';
import { apiFetch, apiFetchMutating } from '@/lib/api/client';

export type AccountDeskSession = {
  id: string;
  createdAt: string;
  lastActivityAt: string | null;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

export type AccountDeskPayload = {
  generatedAt: string;
  profile: AdminStaffProfile;
  sessions: AccountDeskSession[];
};

export async function fetchAccountDesk(): Promise<{ desk?: AccountDeskPayload; error?: string }> {
  const response = await apiFetch('/api/v1/account/desk');
  const body = (await response.json()) as ApiSuccessResponse<{ desk: AccountDeskPayload }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { desk: body.data.desk };
}

export async function patchAccountDeskProfile(body: {
  phone?: string;
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyContactPhone?: string;
  profilePhotoObjectKey?: string;
}): Promise<{ profile?: AdminStaffProfile; error?: string }> {
  const response = await apiFetchMutating('/api/v1/account/desk/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  const parsed = (await response.json()) as ApiSuccessResponse<{ profile: AdminStaffProfile }> | ApiErrorResponse;
  if (!parsed.success) return { error: parsed.error.message };
  return { profile: parsed.data.profile };
}
