import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  actionLink: string | null;
  createdAt: string;
};

export type NotificationInbox = {
  generatedAt: string;
  unreadCount: number;
  items: NotificationRow[];
  page: number;
  limit: number;
  total: number;
};

export async function fetchNotificationInbox(opts?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<{ inbox?: NotificationInbox; error?: string }> {
  const params = new URLSearchParams();
  if (opts?.unreadOnly) params.set('unreadOnly', 'true');
  if (opts?.limit) params.set('limit', String(opts.limit));
  const q = params.toString();
  const response = await apiFetch(`/api/v1/notifications${q ? `?${q}` : ''}`);
  const parsed = await parseApiResponse<{ inbox: NotificationInbox }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { inbox: parsed.data.inbox };
}

export async function markNotificationReadApi(
  notificationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const response = await apiFetchMutating(`/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { ok: false, error: parsed.message };
  return { ok: true };
}

export async function markAllNotificationsReadApi(): Promise<{ ok: boolean; error?: string }> {
  const response = await apiFetchMutating('/api/v1/notifications/read-all', { method: 'POST' });
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { ok: false, error: parsed.message };
  return { ok: true };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isStoreNotificationId(id: string): boolean {
  return UUID_RE.test(id);
}