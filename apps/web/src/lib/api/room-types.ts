import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { RoomCategory, RoomTypeRecord } from '@/components/dashboard/room-types/admin-room-types-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type RoomTypeDirectorySummary = {
  generatedAt: string;
  totalTypes: number;
  activeTypes: number;
  inactiveTypes: number;
  totalRoomCapacity: number;
  averageRoomCapacity: number;
  byCategory: Array<{ category: RoomCategory; count: number }>;
  facets: {
    hostels: string[];
    categories: RoomCategory[];
  };
};

export async function fetchRoomTypeDirectorySummary(): Promise<{
  summary?: RoomTypeDirectorySummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/room-types/directory/summary');
  const parsed = await parseApiResponse<{ summary: RoomTypeDirectorySummary }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { summary: parsed.data.summary };
}

export type RoomTypeDirectoryListParams = {
  page: number;
  limit: number;
  q?: string;
  hostel?: string;
  category?: string;
  capacity?: string;
  price?: string;
  status?: string;
};

export async function fetchRoomTypeDirectoryList(
  params: RoomTypeDirectoryListParams,
): Promise<{
  roomTypes?: RoomTypeRecord[];
  total?: number;
  error?: string;
}> {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params.category && params.category !== 'All Categories') search.set('category', params.category);
  if (params.capacity && params.capacity !== 'All Capacity') search.set('capacity', params.capacity);
  if (params.price && params.price !== 'All Pricing') search.set('price', params.price);
  if (params.status && params.status !== 'All Status') search.set('status', params.status);

  const response = await apiFetch(`/api/v1/room-types/directory?${search.toString()}`);
  let body: ApiSuccessResponse<{ roomTypes: RoomTypeRecord[] }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) {
    return { error: body.error.message };
  }
  return {
    roomTypes: body.data.roomTypes,
    total: body.meta?.pagination?.total_records,
  };
}
