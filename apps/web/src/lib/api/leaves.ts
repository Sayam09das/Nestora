import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type {
  LeaveRecord,
  LeaveTimelineEntry,
} from '@/components/dashboard/leave/admin-leave-data';
import { apiFetch } from '@/lib/api/client';

export type LeaveDeskSummary = {
  generatedAt: string;
  pendingReview: number;
  onLeaveNow: number;
  returningToday: number;
  extensionsPending: number;
  overstayed: number;
  approvedThisWeek: number;
  residentsTotal: number;
  onCampusPercent: number;
  facets: {
    hostels: string[];
    categories: LeaveRecord['category'][];
  };
};

export async function fetchLeaveDeskSummary(): Promise<{
  summary?: LeaveDeskSummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/leave/desk/summary');
  const body = (await response.json()) as ApiSuccessResponse<{ summary: LeaveDeskSummary }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchLeaveDeskApplications(params: {
  q?: string;
  hostel?: string;
  category?: string;
  status?: string;
  limit?: number;
}): Promise<{ applications?: LeaveRecord[]; total?: number; error?: string }> {
  const search = new URLSearchParams();
  search.set('page', '1');
  search.set('limit', String(params.limit ?? 200));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params.category && params.category !== 'All Categories') search.set('category', params.category);
  if (params.status && params.status !== 'All Status') search.set('status', params.status);

  const response = await apiFetch(`/api/v1/leave/desk/applications?${search}`);
  const body = (await response.json()) as
    | ApiSuccessResponse<{ applications: LeaveRecord[] }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return {
    applications: body.data.applications,
    total: body.meta?.pagination?.total_records,
  };
}

export async function fetchLeaveDeskApplication(leaveId: string): Promise<{
  application?: LeaveRecord;
  timeline?: LeaveTimelineEntry[];
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/leave/desk/applications/${encodeURIComponent(leaveId)}`);
  const body = (await response.json()) as
    | ApiSuccessResponse<{ application: LeaveRecord; timeline: LeaveTimelineEntry[] }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { application: body.data.application, timeline: body.data.timeline };
}
