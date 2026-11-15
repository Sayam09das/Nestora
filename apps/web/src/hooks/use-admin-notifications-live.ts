'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchAdminDashboardOverview } from '@/lib/api/dashboard';
import { fetchNotificationInbox, type NotificationRow } from '@/lib/api/notifications';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import {
  formatTopbarNotificationTime,
  loadTopbarReadSet,
  mapNotificationCategory,
  markAllTopbarNotificationsRead,
  markTopbarNotificationRead,
  mergeInboxById,
  storeActionLabel,
  storeInboxCoversCategory,
  syncReadIdsFromStoreItems,
} from '@/lib/topbar/notification-store-inbox';

const LIVE_POLL_MS = 20_000;
const NOTIFICATIONS_READ_KEY = 'nestora-admin-notifications-read';

export type AdminTopbarNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'alert' | 'audit' | 'leave' | 'complaint' | 'incident';
  href?: string;
  actionLabel?: string;
};

function mapStoreNotification(row: NotificationRow): AdminTopbarNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.message,
    time: formatTopbarNotificationTime(row.createdAt),
    kind: mapNotificationCategory(row.category).admin,
    href: row.actionLink ?? undefined,
    actionLabel: storeActionLabel(row.actionLink),
  };
}

function buildDerivedFromOverview(
  generatedAt: string,
  pending?: { leaveRequests: number; complaints: number; studentRegistrations: number },
): AdminTopbarNotification[] {
  if (!pending) return [];
  const time = formatRelativeTimeFromIso(generatedAt);
  const items: AdminTopbarNotification[] = [];

  if (pending.leaveRequests > 0) {
    items.push({
      id: 'admin-pending-leave',
      title: 'Leave queue',
      body: `${pending.leaveRequests} leave request(s) awaiting review across hostels.`,
      time,
      kind: 'leave',
      href: '/admin/leave',
      actionLabel: 'Open desk',
    });
  }
  if (pending.complaints > 0) {
    items.push({
      id: 'admin-open-complaints',
      title: 'Open complaints',
      body: `${pending.complaints} complaint ticket(s) need triage.`,
      time,
      kind: 'complaint',
      href: '/admin/complaints',
      actionLabel: 'Review',
    });
  }
  if (pending.studentRegistrations > 0) {
    items.push({
      id: 'admin-pending-admissions',
      title: 'Registration queue',
      body: `${pending.studentRegistrations} student registration(s) awaiting review.`,
      time,
      kind: 'alert',
      href: '/admin/students/requests',
      actionLabel: 'Open queue',
    });
  }

  return items;
}

export function useAdminNotificationsLive() {
  const [notifications, setNotifications] = useState<AdminTopbarNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadTopbarReadSet(NOTIFICATIONS_READ_KEY));
  const [loading, setLoading] = useState(true);

  const loadInbox = useCallback(async () => {
    try {
      const [storeRes, overviewRes] = await Promise.all([
        fetchNotificationInbox({ limit: 25 }),
        fetchAdminDashboardOverview(),
      ]);

      const storeRows = storeRes.inbox?.items ?? [];
      let derived = overviewRes.overview
        ? buildDerivedFromOverview(
            overviewRes.overview.generatedAt,
            overviewRes.overview.approvals,
          )
        : [];
      if (storeInboxCoversCategory(storeRows, 'leave', { unreadOnly: true })) {
        derived = derived.filter((row) => row.id !== 'admin-pending-leave');
      }
      if (storeInboxCoversCategory(storeRows, 'complaint', { unreadOnly: true })) {
        derived = derived.filter((row) => row.id !== 'admin-open-complaints');
      }

      const storeItems = storeRows.map(mapStoreNotification);
      setNotifications(mergeInboxById(storeItems, derived));
      syncReadIdsFromStoreItems(storeRows, NOTIFICATIONS_READ_KEY, setReadIds);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void loadInbox();
    const interval = window.setInterval(() => void loadInbox(), LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void loadInbox();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadInbox]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.has(item.id)).length,
    [notifications, readIds],
  );

  const markRead = useCallback((id: string) => {
    markTopbarNotificationRead(id, NOTIFICATIONS_READ_KEY, setReadIds);
  }, []);

  const markAllRead = useCallback(() => {
    markAllTopbarNotificationsRead(
      notifications.map((item) => item.id),
      NOTIFICATIONS_READ_KEY,
      setReadIds,
    );
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    readIds,
    markRead,
    markAllRead,
    loading,
    refresh: loadInbox,
  };
}