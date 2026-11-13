import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { SettingField, SettingsPanel } from '@/components/dashboard/settings/admin-settings-data';
import { apiFetch } from '@/lib/api/client';

export type SettingsDeskSummary = {
  generatedAt: string;
  panels: number;
  pendingDrafts: number;
  criticalLocks: number;
  lastPublishHours: number;
  environment: string;
  policyTier: string;
  facets: {
    categories: SettingsPanel['category'][];
    scopes: Array<'University-wide' | 'Hostel overrides'>;
  };
};

export type SettingsPanelDetail = {
  panel: SettingsPanel;
  fields: SettingField[];
  changeLog: Array<{ when: string; actor: string; change: string }>;
};

export async function fetchSettingsDeskSummary(): Promise<{ summary?: SettingsDeskSummary; error?: string }> {
  const response = await apiFetch('/api/v1/settings/desk/summary');
  const body = (await response.json()) as ApiSuccessResponse<{ summary: SettingsDeskSummary }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchSettingsDeskPanels(params: {
  q?: string;
  category?: string;
  scope?: string;
  status?: string;
}): Promise<{ panels?: SettingsPanel[]; error?: string }> {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.category && params.category !== 'All Categories') search.set('category', params.category);
  if (params.scope && params.scope !== 'All scopes') search.set('scope', params.scope);
  if (params.status && params.status !== 'All status') search.set('status', params.status);

  const suffix = search.toString() ? `?${search}` : '';
  const response = await apiFetch(`/api/v1/settings/desk/panels${suffix}`);
  const body = (await response.json()) as ApiSuccessResponse<{ panels: SettingsPanel[] }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { panels: body.data.panels };
}

export async function fetchSettingsPanelDetail(panelId: string): Promise<{ detail?: SettingsPanelDetail; error?: string }> {
  const response = await apiFetch(`/api/v1/settings/desk/panels/${encodeURIComponent(panelId)}`);
  const body = (await response.json()) as ApiSuccessResponse<SettingsPanelDetail> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { detail: body.data };
}
