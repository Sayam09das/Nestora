import type { LeaveRecord, LeaveTimelineEntry } from '@/components/dashboard/leave/admin-leave-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type LeaveDeskSummary = {
  generatedAt: string;
  pendingReview: number;
  onLeaveNow: number;
  returningToday: number;
  extensionsPending: number;
  overstayed: number;
  approvedThisWeek: number;
  onCampusPercent: number | null;
  facets: {
    hostels: string[];
    categories: string[];
  };
};

export type LeaveDeskApplicationsPayload = {
  applications: LeaveRecord[];
};

export type LeaveDeskSummaryPayload = {
  summary: LeaveDeskSummary;
};

export type LeaveDeskApplicationPayload = {
  application: LeaveRecord;
  timeline: LeaveTimelineEntry[];
};

export async function fetchLeaveDeskSummary(hostel?: string): Promise<{
  summary?: LeaveDeskSummary;
  error?: string;
}> {
  const params = new URLSearchParams();
  if (hostel && hostel !== 'All Hostels') {
    params.set('hostel', hostel);
  }
  const qs = params.toString();
  const response = await apiFetch(`/api/v1/leaves/desk/summary${qs ? `?${qs}` : ''}`);
  const parsed = await parseApiResponse<LeaveDeskSummaryPayload>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { summary: parsed.data.summary };
}

export async function fetchLeaveDeskApplications(filters: {
  q?: string;
  hostel?: string;
  category?: string;
  status?: string;
}): Promise<{ applications?: LeaveRecord[]; error?: string }> {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set('q', filters.q.trim());
  if (filters.hostel && filters.hostel !== 'All Hostels') params.set('hostel', filters.hostel);
  if (filters.category && filters.category !== 'All Categories') params.set('category', filters.category);
  if (filters.status && filters.status !== 'All Status') params.set('status', filters.status);
  const response = await apiFetch(`/api/v1/leaves/desk/applications?${params}`);
  const parsed = await parseApiResponse<LeaveDeskApplicationsPayload>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { applications: parsed.data.applications };
}

export async function fetchLeaveDeskApplication(leaveId: string): Promise<{
  application?: LeaveRecord;
  timeline?: LeaveTimelineEntry[];
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/leaves/desk/applications/${leaveId}`);
  const parsed = await parseApiResponse<LeaveDeskApplicationPayload>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { application: parsed.data.application, timeline: parsed.data.timeline };
}

export async function patchLeaveDecision(input: {
  leaveId: string;
  decision: 'Approved' | 'Rejected';
  feedback?: string;
}): Promise<{ application?: LeaveRecord; error?: string }> {
  const response = await apiFetch(`/api/v1/leaves/desk/applications/${input.leaveId}/decision`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision: input.decision, feedback: input.feedback }),
  });
  const parsed = await parseApiResponse<{ application: LeaveRecord }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { application: parsed.data.application };
}
