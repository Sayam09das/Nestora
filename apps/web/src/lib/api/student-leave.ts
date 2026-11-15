import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentLeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export type StudentLeaveRequest = {
  id: string;
  leaveType: string;
  status: StudentLeaveRequestStatus;
  statusLabel: string;
  statusNote: string;
  dateRange: string;
  destination: string;
  reason: string;
  emergencyContact: string;
  submittedAt: string;
  departureDate: string;
  expectedReturnDate: string;
  reviewedAt: string | null;
};

export type StudentLeaveDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canApply: boolean;
  hostelName: string | null;
  leaveTypes: readonly string[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  requests: StudentLeaveRequest[];
};

export type CreateStudentLeaveInput = {
  leaveType: string;
  departureDate: string;
  expectedReturnDate: string;
  destination: string;
  reason: string;
  emergencyContact: string;
};

export async function fetchStudentLeaveDesk(): Promise<{
  desk?: StudentLeaveDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/leave');
  const parsed = await parseApiResponse<{ desk: StudentLeaveDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentLeaveApplication(body: CreateStudentLeaveInput): Promise<{
  desk?: StudentLeaveDesk;
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/leave', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentLeaveDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}