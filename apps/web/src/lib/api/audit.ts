import type { ApiPaginationMeta, ApiSuccessResponse } from '@nestora/types';
import { apiFetch } from '@/lib/api/client';

export type AuditLogRow = {
  id: string;
  actorUserId: string | null;
  actorRole: string;
  actionName: string;
  entityType: string;
  entityId: string;
  previousState: unknown;
  newState: unknown;
  ipAddress: string | null;
  timestamp: string;
};

export type AuditDeskSummary = {
  generatedAt: string;
  entries24h: number;
  sensitiveViews24h: number;
  exportsWeek: number;
  chainVerify: 'OK' | 'WARN';
  retentionYears: number;
};

export type AuditListFilters = {
  page?: number;
  limit?: number;
  q?: string;
  actorUserId?: string;
  actionName?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
};

type AuditLogsResponse = ApiSuccessResponse<{
  logs: AuditLogRow[];
}> & {
  meta?: { pagination?: ApiPaginationMeta };
};

function toSearchParams(filters: AuditListFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export async function fetchAuditDeskSummary(): Promise<{ summary?: AuditDeskSummary; error?: string }> {
  const res = await apiFetch('/api/v1/audit-logs/desk/summary');
  const body = (await res.json()) as
    | ApiSuccessResponse<{ summary: AuditDeskSummary }>
    | { success: false; error: { message: string } };
  if (!res.ok || !body.success) {
    const message =
      'error' in body && body.error?.message ? body.error.message : `Failed to load audit summary (${res.status}).`;
    return { error: message };
  }
  return { summary: body.data.summary };
}

export async function fetchAuditLogById(auditLogId: string): Promise<{ log?: AuditLogRow; error?: string }> {
  const res = await apiFetch(`/api/v1/audit-logs/${encodeURIComponent(auditLogId)}`);
  const body = (await res.json()) as
    | ApiSuccessResponse<{ log: AuditLogRow }>
    | { success: false; error: { message: string } };
  if (!res.ok || !body.success) {
    const message =
      'error' in body && body.error?.message ? body.error.message : `Failed to load audit entry (${res.status}).`;
    return { error: message };
  }
  return { log: body.data.log };
}

export async function fetchAuditLogs(filters: AuditListFilters = {}): Promise<{
  logs: AuditLogRow[];
  pagination?: ApiPaginationMeta;
  error?: string;
}> {
  const qs = toSearchParams(filters);
  const path = `/api/v1/audit-logs${qs ? `?${qs}` : ''}`;
  const res = await apiFetch(path);
  const body = (await res.json()) as AuditLogsResponse | { success: false; error: { message: string } };
  if (!res.ok || !body.success) {
    const message =
      'error' in body && body.error?.message
        ? body.error.message
        : `Failed to load audit logs (${res.status}).`;
    return { logs: [], error: message };
  }
  return {
    logs: body.data.logs,
    pagination: body.meta?.pagination,
  };
}
