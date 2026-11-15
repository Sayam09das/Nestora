import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type OutingDeskRow = {
  id: string;
  outingRef: string;
  studentId: string;
  studentName: string;
  hostel: string;
  roomBed: string;
  outingDate: string;
  departureTime: string;
  expectedReturnTime: string;
  destination: string;
  isExceptional: boolean;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  submittedAt: string;
  gatePassToken: string | null;
};

export type OutingDeskSummary = {
  generatedAt: string;
  pendingReview: number;
  approvedToday: number;
  exceptionalPending: number;
  facets: { hostels: string[] };
};

export async function fetchOutingDeskSummary(): Promise<{ summary?: OutingDeskSummary; error?: string }> {
  const response = await apiFetch('/api/v1/outings/desk/summary');
  const parsed = await parseApiResponse<{ summary: OutingDeskSummary }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { summary: parsed.data.summary };
}

export async function fetchOutingDeskApplications(params: {
  q?: string;
  hostel?: string;
  status?: string;
}): Promise<{ applications?: OutingDeskRow[]; error?: string }> {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params.status && params.status !== 'All Status') search.set('status', params.status);
  const q = search.toString();
  const response = await apiFetch(`/api/v1/outings/desk/applications${q ? `?${q}` : ''}`);
  const parsed = await parseApiResponse<{ applications: OutingDeskRow[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { applications: parsed.data.applications };
}

export async function patchOutingDecision(
  outingId: string,
  body: { decision: 'Approved' | 'Rejected'; feedback?: string },
): Promise<{ application?: OutingDeskRow; error?: string }> {
  const response = await apiFetch(`/api/v1/outings/desk/applications/${outingId}/decision`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ application: OutingDeskRow }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { application: parsed.data.application };
}