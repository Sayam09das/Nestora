import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { RoleProfile } from '@/components/dashboard/roles/admin-roles-data';
import { apiFetch } from '@/lib/api/client';

export type RolesDeskSummary = {
  generatedAt: string;
  roles: number;
  activeAccounts: number;
  hostelsScoped: number;
  customGrants: number;
  pendingReviews: number;
  matrixModules: number;
};

export type RoleDeskDetail = {
  profile: RoleProfile;
  assignments: Array<{ user: string; hostel: string; since: string }>;
};

export async function fetchRolesDeskSummary(): Promise<{ summary?: RolesDeskSummary; error?: string }> {
  const response = await apiFetch('/api/v1/roles/desk/summary');
  const body = (await response.json()) as ApiSuccessResponse<{ summary: RolesDeskSummary }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchRolesDeskProfiles(params: {
  q?: string;
  tier?: string;
  scope?: string;
  risk?: string;
}): Promise<{ roles?: RoleProfile[]; error?: string }> {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.tier && params.tier !== 'All tiers') search.set('tier', params.tier);
  if (params.scope && params.scope !== 'All scopes') search.set('scope', params.scope);
  if (params.risk && params.risk !== 'All risk') search.set('risk', params.risk);

  const suffix = search.toString() ? `?${search}` : '';
  const response = await apiFetch(`/api/v1/roles/desk/roles${suffix}`);
  const body = (await response.json()) as ApiSuccessResponse<{ roles: RoleProfile[] }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { roles: body.data.roles };
}

export async function fetchRoleDeskDetail(roleId: string): Promise<{ detail?: RoleDeskDetail; error?: string }> {
  const response = await apiFetch(`/api/v1/roles/desk/roles/${encodeURIComponent(roleId)}`);
  const body = (await response.json()) as ApiSuccessResponse<RoleDeskDetail> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { detail: body.data };
}
