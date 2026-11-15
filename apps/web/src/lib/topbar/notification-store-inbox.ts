import type { Dispatch, SetStateAction } from 'react';

import {
  isStoreNotificationId,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  type NotificationRow,
} from '@/lib/api/notifications';

export function loadTopbarReadSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function saveTopbarReadSet(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // ignore quota / private mode
  }
}

export function formatTopbarNotificationTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function mergeInboxById<T extends { id: string }>(storeItems: T[], derived: T[]): T[] {
  const storeIds = new Set(storeItems.map((n) => n.id));
  return [...storeItems, ...derived.filter((n) => !storeIds.has(n.id))];
}

/** True when the MOD-07 inbox already has a row for this category (optionally unread only). */
export function storeInboxCoversCategory(
  items: NotificationRow[],
  category: string,
  options?: { unreadOnly?: boolean },
): boolean {
  const cat = category.toLowerCase();
  return items.some((row) => {
    if (row.category.toLowerCase() !== cat) return false;
    if (options?.unreadOnly && row.isRead) return false;
    return true;
  });
}

export function syncReadIdsFromStoreItems(
  items: NotificationRow[],
  storageKey: string,
  setReadIds: Dispatch<SetStateAction<Set<string>>>,
) {
  if (items.length === 0) return;
  setReadIds((current) => {
    const next = new Set(current);
    for (const row of items) {
      if (row.isRead) next.add(row.id);
    }
    saveTopbarReadSet(storageKey, next);
    return next;
  });
}

export function markTopbarNotificationRead(
  id: string,
  storageKey: string,
  setReadIds: Dispatch<SetStateAction<Set<string>>>,
) {
  if (isStoreNotificationId(id)) {
    void markNotificationReadApi(id);
  }
  setReadIds((current) => {
    const next = new Set(current).add(id);
    saveTopbarReadSet(storageKey, next);
    return next;
  });
}

export function markAllTopbarNotificationsRead(
  notificationIds: string[],
  storageKey: string,
  setReadIds: Dispatch<SetStateAction<Set<string>>>,
) {
  if (notificationIds.some(isStoreNotificationId)) {
    void markAllNotificationsReadApi();
  }
  setReadIds(() => {
    const next = new Set(notificationIds);
    saveTopbarReadSet(storageKey, next);
    return next;
  });
}

export function mapNotificationCategory(category: string): {
  student: 'leave' | 'announcement' | 'complaint' | 'maintenance' | 'fee' | 'notice';
  warden: 'complaint' | 'alert' | 'leave' | 'incident' | 'notice';
  staff: 'duty' | 'shift' | 'alert' | 'maintenance' | 'announcement' | 'complaint' | 'leave' | 'incident';
  admin: 'alert' | 'audit' | 'leave' | 'complaint' | 'incident';
} {
  const c = category.toLowerCase();
  const isLeave = c.includes('leave');
  const isComplaint = c.includes('complaint');
  const isMaintenance = c.includes('maintenance');
  const isFee = c.includes('fee');
  const isIncident = c.includes('incident') || c.includes('emergency');
  const isMovement = c.includes('movement') || c.includes('gate');
  const isAnnouncement = c.includes('announcement') || c.includes('notice');

  return {
    student: isLeave
      ? 'leave'
      : isComplaint
        ? 'complaint'
        : isMaintenance
          ? 'maintenance'
          : isFee
            ? 'fee'
            : isIncident
              ? 'notice'
              : isAnnouncement
                ? 'announcement'
                : 'notice',
    warden: isLeave
      ? 'leave'
      : isComplaint
        ? 'complaint'
        : isIncident
          ? 'incident'
          : isMovement
            ? 'alert'
            : isAnnouncement
              ? 'notice'
              : 'alert',
    staff: isMaintenance
      ? 'maintenance'
      : isComplaint
        ? 'complaint'
        : isLeave
          ? 'leave'
          : isIncident
            ? 'incident'
            : isAnnouncement
              ? 'announcement'
              : 'alert',
    admin: isLeave
      ? 'leave'
      : isComplaint
        ? 'complaint'
        : isIncident
          ? 'incident'
          : c.includes('audit')
            ? 'audit'
            : 'alert',
  };
}

export function storeActionLabel(actionLink: string | null | undefined): string | undefined {
  if (!actionLink) return undefined;
  if (actionLink.includes('/leave')) return 'Review';
  if (actionLink.includes('/complaints')) return 'Open ticket';
  if (actionLink.includes('/incidents')) return 'Respond';
  if (actionLink.includes('/gate')) return 'View pass';
  return 'Open';
}