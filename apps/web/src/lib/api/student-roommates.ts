import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';
import type { StudentDashboardOverview } from '@/lib/api/dashboard';

export type StudentRoommatesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  profile: StudentDashboardOverview['profile'];
  residence: StudentDashboardOverview['residence'];
  roommates: StudentDashboardOverview['roommates'];
};

export async function fetchStudentRoommatesDesk(): Promise<{
  desk?: StudentRoommatesDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/roommates');
  const parsed = await parseApiResponse<{ desk: StudentRoommatesDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}