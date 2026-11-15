import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentOutingRequest = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  statusNote: string;
  outingDate: string;
  departureTime: string;
  expectedReturnTime: string;
  destination: string;
  isExceptional: boolean;
  submittedAt: string;
  reviewedAt: string | null;
};

export type StudentOutingDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canApply: boolean;
  hostelName: string | null;
  summary: { total: number; pending: number; approved: number; rejected: number };
  requests: StudentOutingRequest[];
};

export async function fetchStudentOutingDesk(): Promise<{ desk?: StudentOutingDesk; error?: string }> {
  const response = await apiFetch('/api/v1/dashboard/student/outings');
  const parsed = await parseApiResponse<{ desk: StudentOutingDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentOutingApplication(body: {
  outingDate: string;
  departureTime: string;
  expectedReturnTime: string;
  destination: string;
  isExceptional?: boolean;
}): Promise<{ desk?: StudentOutingDesk; error?: string }> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/outings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentOutingDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}