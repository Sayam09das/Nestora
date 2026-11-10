import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { AllocationRecord } from '@/components/dashboard/allocation/admin-allocation-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type AllocationDirectorySummary = {
  generatedAt: string;
  pendingQueue: number;
  allocatedToday: number;
  roomChangePending: number;
  eligibleUnallocated: number;
  bedsAvailable: number;
  totalBedCapacity: number;
  bedsAvailableSharePct: number | null;
  queueByHostel: Array<{ hostel: string; pending: number; availableBeds: number }>;
  facets: {
    hostels: string[];
  };
};

export async function fetchAllocationDirectorySummary(): Promise<{
  summary?: AllocationDirectorySummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/allocations/directory/summary');
  const parsed = await parseApiResponse<{ summary: AllocationDirectorySummary }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { summary: parsed.data.summary };
}

export type AllocationDirectoryListParams = {
  page: number;
  limit: number;
  q?: string;
  status?: string;
  type?: string;
  hostel?: string;
};

export async function fetchAllocationDirectoryList(
  params: AllocationDirectoryListParams,
): Promise<{ allocations?: AllocationRecord[]; total?: number; error?: string }> {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.status && params.status !== 'All Status') search.set('status', params.status);
  if (params.type && params.type !== 'All Types') search.set('type', params.type);
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);

  const response = await apiFetch(`/api/v1/allocations/directory?${search.toString()}`);
  let body: ApiSuccessResponse<{ allocations: AllocationRecord[] }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) return { error: body.error.message };
  return {
    allocations: body.data.allocations,
    total: body.meta?.pagination?.total_records,
  };
}

export async function fetchAllocationQueue(): Promise<{ queue?: AllocationRecord[]; error?: string }> {
  const response = await apiFetch('/api/v1/allocations/directory/queue');
  const parsed = await parseApiResponse<{ queue: AllocationRecord[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { queue: parsed.data.queue };
}
