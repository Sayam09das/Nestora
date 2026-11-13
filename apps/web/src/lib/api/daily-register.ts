import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import { apiFetch } from '@/lib/api/client';

export type DailyRegisterCategory =
  | 'Attendance'
  | 'Movement'
  | 'Visitor'
  | 'Leave'
  | 'Complaint'
  | 'Incident';

export type DailyRegisterEntry = {
  id: string;
  occurredAt: string;
  category: DailyRegisterCategory;
  headline: string;
  detail: string;
  resident?: string;
  location?: string;
  linkPath?: string;
};

export type DailyRegisterDeskSummary = {
  generatedAt: string;
  registerDate: string;
  totalEntries: number;
  attendance: {
    present: number;
    absent: number;
    onLeave: number;
    ratePct: number | null;
  };
  counts: Record<DailyRegisterCategory, number>;
  facets: { categories: DailyRegisterCategory[] };
};

export async function fetchDailyRegisterDeskSummary(params: {
  date?: string;
  hostel?: string;
}): Promise<{ summary?: DailyRegisterDeskSummary; error?: string }> {
  const search = new URLSearchParams();
  if (params.date) search.set('date', params.date);
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  const suffix = search.toString() ? `?${search}` : '';
  const response = await apiFetch(`/api/v1/daily-register/desk/summary${suffix}`);
  const body = (await response.json()) as ApiSuccessResponse<{ summary: DailyRegisterDeskSummary }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchDailyRegisterDeskEntries(params: {
  date?: string;
  hostel?: string;
  category?: string;
  q?: string;
}): Promise<{ entries?: DailyRegisterEntry[]; error?: string }> {
  const search = new URLSearchParams();
  if (params.date) search.set('date', params.date);
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params.category && params.category !== 'All Categories') search.set('category', params.category);
  if (params.q?.trim()) search.set('q', params.q.trim());
  const suffix = search.toString() ? `?${search}` : '';
  const response = await apiFetch(`/api/v1/daily-register/desk/entries${suffix}`);
  const body = (await response.json()) as ApiSuccessResponse<{ entries: DailyRegisterEntry[] }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { entries: body.data.entries };
}
