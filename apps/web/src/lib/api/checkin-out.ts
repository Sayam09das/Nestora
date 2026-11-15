import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type CheckOutRequestRow = {
  id: string;
  status: string;
  plannedDate: string;
  reason: string | null;
  createdAt: string;
  studentName: string;
  regNo: string;
  hostel: string;
  room: string;
  bed: string;
  allocationId: string;
  outstandingDues: number;
  accountantCleared: boolean;
  keysReturned?: boolean;
};

export type StudentCheckOutDesk = {
  generatedAt: string;
  canRequest: boolean;
  hostelName: string | null;
  roomLabel: string | null;
  checkedIn: boolean;
  outstandingDues: number;
  requests: CheckOutRequestRow[];
};

export async function fetchStudentCheckOutDesk(): Promise<{ desk?: StudentCheckOutDesk; error?: string }> {
  const response = await apiFetch('/api/v1/checkin-out/student/desk');
  const parsed = await parseApiResponse<{ desk: StudentCheckOutDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentCheckOutRequest(payload: {
  plannedDate: string;
  reason?: string;
}): Promise<{ desk?: StudentCheckOutDesk; error?: string }> {
  const response = await apiFetch('/api/v1/checkin-out/student/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<{ desk: StudentCheckOutDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function fetchWardenCheckOutQueue(): Promise<{
  requests?: CheckOutRequestRow[];
  error?: string;
}> {
  const response = await apiFetch('/api/v1/checkin-out/warden/requests?status=PENDING');
  const parsed = await parseApiResponse<{ requests: CheckOutRequestRow[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { requests: parsed.data.requests };
}

export async function finalizeWardenCheckOut(
  requestId: string,
  payload: {
    keysReturned: boolean;
    remarks?: string;
    inspections: Array<{ itemName: string; condition: 'INTACT' | 'DAMAGED' | 'MISSING'; damageFee?: number }>;
  },
): Promise<{ error?: string }> {
  const response = await apiFetch(
    `/api/v1/checkin-out/warden/requests/${encodeURIComponent(requestId)}/finalize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}

export async function recordWardenCheckIn(payload: {
  allocationId: string;
  keysIssued: boolean;
  remarks?: string;
}): Promise<{ error?: string }> {
  const response = await apiFetch('/api/v1/checkin-out/warden/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}

export async function fetchAccountantCheckOutQueue(): Promise<{
  requests?: CheckOutRequestRow[];
  error?: string;
}> {
  const response = await apiFetch('/api/v1/checkin-out/accountant/requests?status=PENDING');
  const parsed = await parseApiResponse<{ requests: CheckOutRequestRow[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { requests: parsed.data.requests };
}

export async function postAccountantCheckOutClearance(
  requestId: string,
  payload: { affirmDuesCleared: boolean; remarks?: string },
): Promise<{ error?: string }> {
  const response = await apiFetch(
    `/api/v1/checkin-out/accountant/requests/${encodeURIComponent(requestId)}/clearance`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}

export async function cancelStudentCheckOutRequest(requestId: string): Promise<{
  desk?: StudentCheckOutDesk;
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/checkin-out/student/requests/${encodeURIComponent(requestId)}/cancel`, {
    method: 'POST',
  });
  const parsed = await parseApiResponse<{ desk: StudentCheckOutDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function rejectWardenCheckOut(requestId: string, remarks: string): Promise<{ error?: string }> {
  const response = await apiFetch(
    `/api/v1/checkin-out/warden/requests/${encodeURIComponent(requestId)}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remarks }),
    },
  );
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}