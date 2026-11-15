import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentVisitorStatus = 'pending' | 'approved' | 'inside' | 'checked_out' | 'rejected';

export type StudentVisitorRequest = {
  id: string;
  visitorRef: string;
  visitorName: string;
  visitorPhone: string;
  idProofType: string;
  idProofMasked: string;
  purpose: string;
  status: StudentVisitorStatus;
  statusLabel: string;
  statusNote: string;
  submittedAt: string;
  checkInTime: string | null;
  checkOutTime: string | null;
};

export type StudentVisitorDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canSubmit: boolean;
  hostelName: string | null;
  idProofTypes: readonly string[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    inside: number;
    checkedOut: number;
    rejected: number;
  };
  requests: StudentVisitorRequest[];
};

export type CreateStudentVisitorInput = {
  visitorName: string;
  visitorPhone: string;
  idProofType: string;
  idProofNumber: string;
  purpose: string;
};

export async function fetchStudentVisitorDesk(): Promise<{
  desk?: StudentVisitorDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/visitors');
  const parsed = await parseApiResponse<{ desk: StudentVisitorDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentVisitorRequest(body: CreateStudentVisitorInput): Promise<{
  desk?: StudentVisitorDesk;
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/visitors', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentVisitorDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}