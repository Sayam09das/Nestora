import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentComplaintStatus = 'in_progress' | 'resolved' | 'open';

export type StudentComplaintTicket = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  location: string;
  suggestedPriority: string;
  status: StudentComplaintStatus;
  statusLabel: string;
  statusNote: string;
  submittedAt: string;
  updatedAt: string;
};

export type StudentComplaintsDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canSubmit: boolean;
  hostelName: string | null;
  defaultLocation: string | null;
  categories: readonly string[];
  priorities: readonly string[];
  summary: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  tickets: StudentComplaintTicket[];
};

export type CreateStudentComplaintInput = {
  category: string;
  title: string;
  description: string;
  location: string;
  suggestedPriority: string;
};

export async function fetchStudentComplaintsDesk(): Promise<{
  desk?: StudentComplaintsDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/complaints');
  const parsed = await parseApiResponse<{ desk: StudentComplaintsDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentComplaint(body: CreateStudentComplaintInput): Promise<{
  desk?: StudentComplaintsDesk;
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/complaints', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentComplaintsDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}