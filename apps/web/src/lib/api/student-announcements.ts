import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentAnnouncementItem = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  scope: string;
  relativeTime: string;
  publishedAt: string;
  expiresAt: string | null;
  status: 'live' | 'scheduled' | 'expired';
  statusLabel: string;
  author: string;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  attachments: Array<{ id: string; fileName: string; fileSize: number }>;
  isEmergency: boolean;
};

export type StudentAnnouncementsDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    total: number;
    mandatory: number;
    unacknowledged: number;
    emergency: number;
  };
  announcements: StudentAnnouncementItem[];
};

export async function fetchStudentAnnouncementsDesk(): Promise<{
  desk?: StudentAnnouncementsDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/announcements');
  const parsed = await parseApiResponse<{ desk: StudentAnnouncementsDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function acknowledgeStudentNotice(noticeId: string): Promise<{
  desk?: StudentAnnouncementsDesk;
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/announcements/acknowledge', {
    method: 'POST',
    body: JSON.stringify({ noticeId }),
  });
  const parsed = await parseApiResponse<{ desk: StudentAnnouncementsDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}