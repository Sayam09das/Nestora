import type { VisitorDeskRecord } from '@/components/dashboard/visitors/visitor-desk-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type VisitorDeskSummary = {
  generatedAt: string;
  totalToday: number;
  pendingApproval: number;
  insideNow: number;
  checkedOutToday: number;
  facets: { hostels: string[] };
};

export async function fetchVisitorDeskSummary(hostel?: string): Promise<{
  summary?: VisitorDeskSummary;
  error?: string;
}> {
  const params = new URLSearchParams();
  if (hostel && hostel !== 'All Hostels') params.set('hostel', hostel);
  const qs = params.toString();
  const response = await apiFetch(`/api/v1/visitors/desk/summary${qs ? `?${qs}` : ''}`);
  const parsed = await parseApiResponse<{ summary: VisitorDeskSummary }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { summary: parsed.data.summary };
}

export async function fetchVisitorDeskRecords(filters: {
  q?: string;
  hostel?: string;
  status?: string;
}): Promise<{ records?: VisitorDeskRecord[]; error?: string }> {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set('q', filters.q.trim());
  if (filters.hostel && filters.hostel !== 'All Hostels') params.set('hostel', filters.hostel);
  if (filters.status && filters.status !== 'All Status') params.set('status', filters.status);
  const response = await apiFetch(`/api/v1/visitors/desk/records?${params}`);
  const parsed = await parseApiResponse<{ records: VisitorDeskRecord[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { records: parsed.data.records };
}

export async function registerVisitor(body: {
  studentId: string;
  visitorName: string;
  visitorPhone: string;
  idProofType: string;
  idProofNumber: string;
  purpose: string;
  isException?: boolean;
}): Promise<{ record?: VisitorDeskRecord; error?: string }> {
  const response = await apiFetch('/api/v1/visitors/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ record: VisitorDeskRecord }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { record: parsed.data.record };
}

async function patchVisitorAction(
  visitorId: string,
  action: 'approve' | 'reject' | 'check-in' | 'check-out',
  body?: object,
): Promise<{ record?: VisitorDeskRecord; error?: string }> {
  const response = await apiFetch(`/api/v1/visitors/${visitorId}/${action}`, {
    method: 'PATCH',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const parsed = await parseApiResponse<{ record: VisitorDeskRecord }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { record: parsed.data.record };
}

export const approveVisitor = (id: string) => patchVisitorAction(id, 'approve');
export const rejectVisitor = (id: string) => patchVisitorAction(id, 'reject', {});
export const checkInVisitor = (id: string) => patchVisitorAction(id, 'check-in');
export const checkOutVisitor = (id: string) => patchVisitorAction(id, 'check-out');
