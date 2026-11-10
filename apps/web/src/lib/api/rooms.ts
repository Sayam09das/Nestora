import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type RoomDirectorySummary = {
  generatedAt: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  facets: {
    hostels: string[];
    blocks: string[];
    floors: string[];
    roomTypes: string[];
  };
};

type DirectoryRowPayload = RoomRecord;

export async function fetchRoomDirectorySummary(): Promise<{
  summary?: RoomDirectorySummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/rooms/directory/summary');
  const parsed = await parseApiResponse<{ summary: RoomDirectorySummary }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { summary: parsed.data.summary };
}

export type RoomDirectoryListParams = {
  page: number;
  limit: number;
  q?: string;
  hostel?: string;
  block?: string;
  floor?: string;
  roomType?: string;
  status?: string;
  occupancy?: string;
};

export async function fetchRoomDirectoryList(
  params: RoomDirectoryListParams,
): Promise<{
  rooms?: RoomRecord[];
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
  if (params.roomType && params.roomType !== 'All Types') {
    search.set('roomType', params.roomType);
  }
  if (params.status && params.status !== 'All Status') {
    search.set('status', params.status);
  }
  if (params.occupancy && params.occupancy !== 'All Occupancy') {
    search.set('occupancy', params.occupancy);
  }

  const response = await apiFetch(`/api/v1/rooms/directory?${search.toString()}`);
  let body: ApiSuccessResponse<{ rooms: DirectoryRowPayload[] }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) {
    return { error: body.error.message };
  }
  return {
    rooms: body.data.rooms,
    total: body.meta?.pagination?.total_records,
  };
}
