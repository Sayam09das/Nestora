import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentRuleSource = 'policy' | 'notice';

export type StudentRuleItem = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  source: StudentRuleSource;
  scope: string;
  scopeKind: 'university' | 'hostel';
  updatedAt: string;
  updatedLabel: string;
};

export type StudentRulesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    total: number;
    university: number;
    hostel: number;
    fromNotices: number;
  };
  rules: StudentRuleItem[];
};

export async function fetchStudentRulesDesk(): Promise<{
  desk?: StudentRulesDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/rules');
  const parsed = await parseApiResponse<{ desk: StudentRulesDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}