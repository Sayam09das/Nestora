import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type GuardGateMovementRow = {
  id: string;
  passToken: string;
  studentName: string;
  registrationNumber: string;
  hostelName: string;
  roomBed: string;
  actualDeparture: string | null;
  actualReturn: string | null;
  isLateReturn: boolean;
  status: 'out' | 'returned';
};

export type GuardGateConsoleDesk = {
  generatedAt: string;
  hostelNames: string[];
  unassigned: boolean;
  summary: {
    currentlyOut: number;
    exitsToday: number;
    returnsToday: number;
  };
  recentMovements: GuardGateMovementRow[];
};

export type GuardGateLookupResult = {
  passId: string;
  passToken: string;
  studentName: string;
  registrationNumber: string;
  hostelName: string;
  roomBed: string;
  leaveType: string;
  destination: string;
  validFrom: string;
  validUntil: string;
  passValidity: 'valid' | 'not_yet' | 'expired';
  movementPhase: 'ready_exit' | 'out' | 'returned' | 'closed';
  openMovementId: string | null;
  canRecordExit: boolean;
  canRecordReturn: boolean;
  isLateReturnRisk: boolean;
};

export async function fetchGuardGateConsoleDesk(): Promise<{ desk?: GuardGateConsoleDesk; error?: string }> {
  const response = await apiFetch('/api/v1/dashboard/guard/gate-console');
  const parsed = await parseApiResponse<{ desk: GuardGateConsoleDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function lookupGuardGatePass(token: string): Promise<{ result?: GuardGateLookupResult; error?: string }> {
  const response = await apiFetchMutating('/api/v1/dashboard/guard/gate-console/lookup', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  const parsed = await parseApiResponse<{ result: GuardGateLookupResult }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { result: parsed.data.result };
}

export async function recordGuardGateExit(
  passId: string,
  remarks?: string,
): Promise<{ result?: GuardGateLookupResult; error?: string }> {
  const response = await apiFetchMutating('/api/v1/dashboard/guard/gate-console/exit', {
    method: 'POST',
    body: JSON.stringify({ passId, ...(remarks?.trim() ? { remarks: remarks.trim() } : {}) }),
  });
  const parsed = await parseApiResponse<{ result: GuardGateLookupResult }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { result: parsed.data.result };
}

export async function recordGuardGateReturn(
  passId: string,
  remarks?: string,
): Promise<{ result?: GuardGateLookupResult; error?: string }> {
  const response = await apiFetchMutating('/api/v1/dashboard/guard/gate-console/return', {
    method: 'POST',
    body: JSON.stringify({ passId, ...(remarks?.trim() ? { remarks: remarks.trim() } : {}) }),
  });
  const parsed = await parseApiResponse<{ result: GuardGateLookupResult }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { result: parsed.data.result };
}