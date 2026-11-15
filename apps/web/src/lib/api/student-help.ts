import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';
import type { StudentComplaintTicket } from '@/lib/api/student-complaints';

export type StudentHelpArticle = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export type StudentHelpContact = {
  id: string;
  role: string;
  name: string;
  phone: string | null;
  email: string | null;
  telHref: string | null;
};

export type StudentHelpQuickLink = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type StudentHelpDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  canSubmit: boolean;
  summary: {
    openRequests: number;
    inProgress: number;
    resolved: number;
  };
  faq: StudentHelpArticle[];
  contacts: StudentHelpContact[];
  quickLinks: StudentHelpQuickLink[];
  supportRequests: StudentComplaintTicket[];
};

export async function fetchStudentHelpDesk(): Promise<{
  desk?: StudentHelpDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/help');
  const parsed = await parseApiResponse<{ desk: StudentHelpDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentHelpRequest(body: {
  title: string;
  description: string;
}): Promise<{
  desk?: StudentHelpDesk;
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/help/request', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentHelpDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}