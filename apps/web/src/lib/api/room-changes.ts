import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type RoomConfigOption = {
  id: string;
  code: string;
  label: string;
  capacity: number;
  hasAc: boolean;
};

export type RoomChangeRequestRow = {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  studentName: string;
  regNo: string;
  currentHostel: string;
  currentRoom: string;
  currentBed: string;
  preferredConfigLabel: string;
  preferredConfigId: string;
  studentUserId: string;
};

export async function fetchStudentRoomConfigOptions(): Promise<{ options?: RoomConfigOption[]; error?: string }> {
  const response = await apiFetch('/api/v1/allocations/room-config-options');
  const parsed = await parseApiResponse<{ options: RoomConfigOption[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { options: parsed.data.options };
}

export async function submitRoomChangeRequest(payload: {
  preferredConfigId: string;
  reason: string;
}): Promise<{ id?: string; error?: string }> {
  const response = await apiFetch('/api/v1/allocations/room-changes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<{ id: string }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { id: parsed.data.id };
}

export async function fetchRoomChangeQueue(): Promise<{ requests?: RoomChangeRequestRow[]; error?: string }> {
  const response = await apiFetch('/api/v1/allocations/room-changes');
  const parsed = await parseApiResponse<{ requests: RoomChangeRequestRow[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { requests: parsed.data.requests };
}

export async function approveRoomChange(
  requestId: string,
  payload: { bedId: string; remarks?: string },
): Promise<{ error?: string }> {
  const response = await apiFetch(`/api/v1/allocations/room-changes/${encodeURIComponent(requestId)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}

export async function rejectRoomChange(requestId: string, remarks: string): Promise<{ error?: string }> {
  const response = await apiFetch(`/api/v1/allocations/room-changes/${encodeURIComponent(requestId)}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remarks }),
  });
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}