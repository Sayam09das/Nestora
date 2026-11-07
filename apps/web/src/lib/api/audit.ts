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

export type AuditListFilters = {
  page?: number;
  limit?: number;
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
