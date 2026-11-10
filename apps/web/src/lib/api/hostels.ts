import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { HostelGenderCategory, HostelRecord } from '@/components/dashboard/hostels/admin-hostels-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type HostelDirectorySummary = {
  generatedAt: string;
  totalHostels: number;
  activeHostels: number;
  underSetup: number;
  inactiveHostels: number;
  totalBedCapacity: number;
  averageOccupancyPct: number | null;
  boysBedsSharePct: number | null;
  girlsBedsSharePct: number | null;
  byGender: Array<{ label: HostelGenderCategory; count: number; beds: number }>;
  facets: {
    campuses: string[];
    genders: HostelGenderCategory[];
  };
};

export async function fetchHostelDirectorySummary(): Promise<{
  summary?: HostelDirectorySummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/hostels/directory/summary');
  const parsed = await parseApiResponse<{ summary: HostelDirectorySummary }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { summary: parsed.data.summary };
}

export type HostelDirectoryListParams = {
  page: number;
  limit: number;
  q?: string;
  gender?: string;
  campus?: string;
  status?: string;
  occupancy?: string;
};

export async function fetchHostelDirectoryList(
  params: HostelDirectoryListParams,
): Promise<{ hostels?: HostelRecord[]; total?: number; error?: string }> {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.gender && params.gender !== 'All Categories') search.set('gender', params.gender);
  if (params.campus && params.campus !== 'All Campus Zones') search.set('campus', params.campus);
  if (params.status && params.status !== 'All Status') search.set('status', params.status);
  if (params.occupancy && params.occupancy !== 'All Occupancy') search.set('occupancy', params.occupancy);

  const response = await apiFetch(`/api/v1/hostels/directory?${search.toString()}`);
  let body: ApiSuccessResponse<{ hostels: HostelRecord[] }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) return { error: body.error.message };
  return {
    hostels: body.data.hostels,
    total: body.meta?.pagination?.total_records,
  };
}
