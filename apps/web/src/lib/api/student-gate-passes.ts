import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentGatePassRow = {
  id: string;
  passToken: string;
  leaveId: string | null;
  leaveType: string | null;
  destination: string | null;
  dateRange: string;
  validFrom: string;
  validUntil: string;
  isUsed: boolean;
  status: 'active' | 'expired' | 'used';
  statusLabel: string;
};

export type StudentGatePassesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    active: number;
    expired: number;
    used: number;
  };
  passes: StudentGatePassRow[];
};

export async function fetchStudentGatePassesDesk(): Promise<{
  desk?: StudentGatePassesDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/gate-passes');
  const parsed = await parseApiResponse<{ desk: StudentGatePassesDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}