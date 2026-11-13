import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { BedRecord } from '@/components/dashboard/beds/admin-beds-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type BedDirectorySummary = {
  generatedAt: string;
  totalBeds: number;
  occupied: number;
  available: number;
  reserved: number;
  maintenance: number;
  occupiedRatePercent: number | null;
  byHostel: Array<{
    hostel: string;
    total: number;
    available: number;
    occupied: number;
  }>;
  facets: {
    hostels: string[];
    blocks: string[];
    floors: string[];
    rooms: string[];
  };
};

export async function fetchBedDirectoryById(bedId: string): Promise<{
  bed?: BedRecord;
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/beds/directory/${encodeURIComponent(bedId)}`);
  const parsed = await parseApiResponse<{ bed: BedRecord }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { bed: parsed.data.bed };
}

export async function fetchBedDirectorySummary(): Promise<{
  summary?: BedDirectorySummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/beds/directory/summary');
  const parsed = await parseApiResponse<{ summary: BedDirectorySummary }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { summary: parsed.data.summary };
}

export type BedDirectoryListParams = {
  page: number;
  limit: number;
  q?: string;
  hostel?: string;
  block?: string;
  floor?: string;
  room?: string;
  status?: string;
};

export async function fetchBedDirectoryList(
  params: BedDirectoryListParams,
): Promise<{
  beds?: BedRecord[];
  total?: number;
  error?: string;
}> {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  if (params.q?.trim()) {
    search.set('q', params.q.trim());
  }
  if (params.hostel && params.hostel !== 'All Hostels') {
    search.set('hostel', params.hostel);
  }
  if (params.block && params.block !== 'All Blocks') {
    search.set('block', params.block);
  }
  if (params.floor && params.floor !== 'All Floors') {
    search.set('floor', params.floor);
  }
  if (params.room && params.room !== 'All Rooms') {
    search.set('room', params.room);
  }
  if (params.status && params.status !== 'All Status') {
    search.set('status', params.status);
  }

  const response = await apiFetch(`/api/v1/beds/directory?${search.toString()}`);
  let body: ApiSuccessResponse<{ beds: BedRecord[] }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) {
    return { error: body.error.message };
  }
  return {
    beds: body.data.beds,
    total: body.meta?.pagination?.total_records,
  };
}
