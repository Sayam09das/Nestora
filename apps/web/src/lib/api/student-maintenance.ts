import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';
import type { StudentComplaintTicket } from '@/lib/api/student-complaints';

export type StudentMaintenanceDesk = {
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
  requests: StudentComplaintTicket[];
};

export type CreateStudentMaintenanceInput = {
  category: string;
  title: string;
  description: string;
  location: string;
  suggestedPriority: string;
};

export async function fetchStudentMaintenanceDesk(): Promise<{
  desk?: StudentMaintenanceDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/maintenance');
  const parsed = await parseApiResponse<{ desk: StudentMaintenanceDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentMaintenanceRequest(body: CreateStudentMaintenanceInput): Promise<{
  desk?: StudentMaintenanceDesk;
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/maintenance', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentMaintenanceDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}