import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { AnnouncementRecord } from '@/components/dashboard/announcements/admin-announcements-data';
import { apiFetch } from '@/lib/api/client';

export type AnnouncementsDeskSummary = {
  generatedAt: string;
  liveNow: number;
  scheduled: number;
  ackPending: number;
  avgReadRate: number;
  emergencyActive: number;
  publishedThisMonth: number;
  facets: {
    scopes: string[];
    categories: AnnouncementRecord['category'][];
  };
};

export async function fetchAnnouncementsDeskSummary(scope?: string): Promise<{
  summary?: AnnouncementsDeskSummary;
  error?: string;
}> {
  const params = new URLSearchParams();
  if (scope && scope !== 'All Scopes') params.set('scope', scope);
  const qs = params.toString();
  const response = await apiFetch(`/api/v1/announcements/desk/summary${qs ? `?${qs}` : ''}`);
  const body = (await response.json()) as
    | ApiSuccessResponse<{ summary: AnnouncementsDeskSummary }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchAnnouncementsDeskNotices(params: {
  q?: string;
  category?: string;
  scope?: string;
  status?: string;
  limit?: number;
}): Promise<{ notices?: AnnouncementRecord[]; total?: number; error?: string }> {
  const search = new URLSearchParams();
  search.set('page', '1');
  search.set('limit', String(params.limit ?? 120));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.category && params.category !== 'All Categories') search.set('category', params.category);
  if (params.scope && params.scope !== 'All Scopes') search.set('scope', params.scope);
  if (params.status && params.status !== 'All Status') search.set('status', params.status);

  const response = await apiFetch(`/api/v1/announcements/desk/notices?${search}`);
  const body = (await response.json()) as
    | ApiSuccessResponse<{ notices: AnnouncementRecord[] }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { notices: body.data.notices, total: body.meta?.pagination?.total_records };
}

export async function fetchAnnouncementDeskNotice(noticeId: string): Promise<{
  notice?: AnnouncementRecord;
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/announcements/desk/notices/${encodeURIComponent(noticeId)}`);
  const body = (await response.json()) as
    | ApiSuccessResponse<{ notice: AnnouncementRecord }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { notice: body.data.notice };
}
