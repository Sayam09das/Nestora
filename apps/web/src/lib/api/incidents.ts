import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type {
  IncidentActionLogEntry,
  IncidentDeskRecord,
  IncidentsDeskSummary,
} from '@/components/dashboard/incidents/incident-desk-data';
import { apiFetch } from '@/lib/api/client';

export type { IncidentsDeskSummary };

export async function fetchIncidentsDeskSummary(hostel?: string): Promise<{
  summary?: IncidentsDeskSummary;
  error?: string;
}> {
  const params = new URLSearchParams();
  if (hostel && hostel !== 'All Hostels') params.set('hostel', hostel);
  const qs = params.toString();
  const response = await apiFetch(`/api/v1/incidents/desk/summary${qs ? `?${qs}` : ''}`);
  const body = (await response.json()) as ApiSuccessResponse<{ summary: IncidentsDeskSummary }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchIncidentsDeskRecords(params: {
  q?: string;
  hostel?: string;
  type?: string;
  severity?: string;
  status?: string;
  limit?: number;
}): Promise<{ records?: IncidentDeskRecord[]; total?: number; error?: string }> {
  const search = new URLSearchParams();
  search.set('page', '1');
  search.set('limit', String(params.limit ?? 120));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params.type && params.type !== 'All Types') search.set('type', params.type);
  if (params.severity && params.severity !== 'All Severities') search.set('severity', params.severity);
  if (params.status && params.status !== 'All Status') search.set('status', params.status);

  const response = await apiFetch(`/api/v1/incidents/desk/records?${search}`);
  const body = (await response.json()) as ApiSuccessResponse<{ records: IncidentDeskRecord[] }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return {
    records: body.data.records,
    total: body.meta?.pagination?.total_records,
  };
}

export async function fetchIncidentDeskRecord(incidentId: string): Promise<{
  record?: IncidentDeskRecord;
  timeline?: IncidentActionLogEntry[];
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/incidents/desk/${encodeURIComponent(incidentId)}`);
  const body = (await response.json()) as
    | ApiSuccessResponse<{ record: IncidentDeskRecord; timeline: IncidentActionLogEntry[] }>
    | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { record: body.data.record, timeline: body.data.timeline };
}

export async function acknowledgeIncident(incidentId: string): Promise<{ record?: IncidentDeskRecord; error?: string }> {
  const response = await apiFetch(`/api/v1/incidents/desk/${encodeURIComponent(incidentId)}/acknowledge`, {
    method: 'PATCH',
  });
  const body = (await response.json()) as ApiSuccessResponse<{ record: IncidentDeskRecord }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { record: body.data.record };
}

export async function markIncidentInProgress(
  incidentId: string,
  actionTaken: string,
): Promise<{ record?: IncidentDeskRecord; error?: string }> {
  const response = await apiFetch(`/api/v1/incidents/desk/${encodeURIComponent(incidentId)}/in-progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionTaken }),
  });
  const body = (await response.json()) as ApiSuccessResponse<{ record: IncidentDeskRecord }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { record: body.data.record };
}

export async function patchIncidentSeverity(
  incidentId: string,
  input: { officialSeverity: IncidentDeskRecord['effectiveSeverity']; notes?: string },
): Promise<{ record?: IncidentDeskRecord; error?: string }> {
  const response = await apiFetch(`/api/v1/incidents/desk/${encodeURIComponent(incidentId)}/severity`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as ApiSuccessResponse<{ record: IncidentDeskRecord }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { record: body.data.record };
}

export async function resolveIncident(
  incidentId: string,
  actionTaken: string,
): Promise<{ record?: IncidentDeskRecord; error?: string }> {
  const response = await apiFetch(`/api/v1/incidents/desk/${encodeURIComponent(incidentId)}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionTaken }),
  });
  const body = (await response.json()) as ApiSuccessResponse<{ record: IncidentDeskRecord }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { record: body.data.record };
}
