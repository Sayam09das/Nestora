import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentEventTiming = 'upcoming' | 'ongoing' | 'past';

export type StudentEventItem = {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  scope: string;
  location: string;
  scheduleLabel: string;
  day: string;
  month: string;
  eventAt: string;
  eventAtDisplay: string;
  endsAt: string | null;
  timing: StudentEventTiming;
  timingLabel: string;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  publishedLabel: string;
};

export type StudentEventsDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    total: number;
    upcoming: number;
    ongoing: number;
    needsAck: number;
  };
  events: StudentEventItem[];
};

export async function fetchStudentEventsDesk(): Promise<{
  desk?: StudentEventsDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/events');
  const parsed = await parseApiResponse<{ desk: StudentEventsDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}