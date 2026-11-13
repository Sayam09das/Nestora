import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type {
  ComplaintTicket,
  ComplaintTimelineEntry,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { apiFetch } from '@/lib/api/client';

export type ComplaintsDeskSummary = {
  generatedAt: string;
  openTickets: number;
  slaAtRisk: number;
  resolvedThisWeek: number;
  avgTurnaroundHours: number;
  reopened: number;
  categoryHotspot: string;
  facets: {
    hostels: string[];
    categories: Array<ComplaintTicket['category']>;
  };
};

export async function fetchComplaintsDeskSummary(hostel?: string): Promise<{
  summary?: ComplaintsDeskSummary;
  error?: string;
}> {
  const params = new URLSearchParams();
  if (hostel && hostel !== 'All Hostels') params.set('hostel', hostel);
  const qs = params.toString();
  const response = await apiFetch(`/api/v1/complaints/desk/summary${qs ? `?${qs}` : ''}`);
  const body = (await response.json()) as ApiSuccessResponse<{ summary: ComplaintsDeskSummary }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchComplaintsDeskTickets(params: {
  q?: string;
  hostel?: string;
  category?: string;
  priority?: string;
  status?: string;
  limit?: number;
}): Promise<{ tickets?: ComplaintTicket[]; total?: number; error?: string }> {
  const search = new URLSearchParams();
  search.set('page', '1');
  search.set('limit', String(params.limit ?? 120));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params.category && params.category !== 'All Categories') search.set('category', params.category);
  if (params.priority && params.priority !== 'All Priorities') search.set('priority', params.priority);
  if (params.status && params.status !== 'All Status') search.set('status', params.status);

  const response = await apiFetch(`/api/v1/complaints/desk/tickets?${search}`);
  const body = (await response.json()) as ApiSuccessResponse<{ tickets: ComplaintTicket[] }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return {
    tickets: body.data.tickets,
    total: body.meta?.pagination?.total_records,
  };
}

export async function assignComplaintTicket(input: {
  ticketId: string;
  staffUserId: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}): Promise<{ ticket?: ComplaintTicket; error?: string }> {
  const response = await apiFetch(
    `/api/v1/complaints/desk/tickets/${encodeURIComponent(input.ticketId)}/assign`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffUserId: input.staffUserId, priority: input.priority }),
    },
  );
  const body = (await response.json()) as
    | ApiSuccessResponse<{ ticket: ComplaintTicket }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { ticket: body.data.ticket };
}

export async function fetchComplaintDeskTicket(ticketId: string): Promise<{
  ticket?: ComplaintTicket;
  timeline?: ComplaintTimelineEntry[];
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/complaints/desk/tickets/${encodeURIComponent(ticketId)}`);
  const body = (await response.json()) as
    | ApiSuccessResponse<{ ticket: ComplaintTicket; timeline: ComplaintTimelineEntry[] }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { ticket: body.data.ticket, timeline: body.data.timeline };
}
