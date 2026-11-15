'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchAnnouncementsDeskNotices } from '@/lib/api/announcements';
import { fetchComplaintsDeskTickets } from '@/lib/api/complaints';
import { fetchStaffDashboardOverview } from '@/lib/api/dashboard';
import { fetchNotificationInbox, type NotificationRow } from '@/lib/api/notifications';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import {
  formatTopbarNotificationTime,
  loadTopbarReadSet,
  mapNotificationCategory,
  markAllTopbarNotificationsRead,
  markTopbarNotificationRead,
  mergeInboxById,
  saveTopbarReadSet,
  storeInboxCoversCategory,
  syncReadIdsFromStoreItems,
} from '@/lib/topbar/notification-store-inbox';

const LIVE_POLL_MS = 20_000;
const NOTIFICATIONS_READ_KEY = 'nestora-staff-notifications-read';
const MESSAGES_READ_KEY = 'nestora-staff-messages-read';

export type StaffTopbarNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'duty' | 'shift' | 'alert' | 'maintenance' | 'announcement' | 'complaint' | 'leave' | 'incident';
  href?: string;
};

export type StaffTopbarMessage = {
  id: string;
  from: string;
  role: string;
  preview: string;
  time: string;
  unread: boolean;
  href?: string;
};

export type StaffTopbarSearchHit = {
  id: string;
  category: 'Tasks' | 'Visitors' | 'Notices' | 'Maintenance';
  label: string;
  hint: string;
  href: string;
};

function mapStoreNotification(row: NotificationRow): StaffTopbarNotification {
  const kinds = mapNotificationCategory(row.category);
  return {
    id: row.id,
    title: row.title,
    body: row.message,
    time: formatTopbarNotificationTime(row.createdAt),
    kind: kinds.staff,
    href: row.actionLink ?? undefined,
  };
}

type Options = {
  workplaceName: string;
  displayName: string;
};

export function useStaffTopbarLive({ workplaceName, displayName }: Options) {
  const [notifications, setNotifications] = useState<StaffTopbarNotification[]>([]);
  const [messages, setMessages] = useState<StaffTopbarMessage[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() =>
    loadTopbarReadSet(NOTIFICATIONS_READ_KEY),
  );
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(() => loadTopbarReadSet(MESSAGES_READ_KEY));
  const [loading, setLoading] = useState(true);

  const hostelFilter =
    workplaceName && workplaceName !== 'No hostel assigned' && !workplaceName.startsWith('Hostel ·')
      ? workplaceName.split(' · ')[0]
      : undefined;

  const loadInbox = useCallback(async () => {
    try {
      const [overviewRes, complaintsRes, noticesRes, storeRes] = await Promise.all([
        fetchStaffDashboardOverview(),
        fetchComplaintsDeskTickets({ limit: 12, hostel: hostelFilter, status: 'All Status' }),
        fetchAnnouncementsDeskNotices({ limit: 10, status: 'Live' }),
        fetchNotificationInbox({ limit: 20 }),
      ]);

      const overview = overviewRes.overview;
      const ops = overview?.operations;
      const nextNotifications: StaffTopbarNotification[] = [];
      const generatedAt = overview?.generatedAt ?? new Date().toISOString();

      if (ops && ops.myAssignedTickets > 0) {
        nextNotifications.push({
          id: 'assigned-tickets',
          title: 'Assigned work orders',
          body: `${ops.myAssignedTickets} maintenance ticket(s) assigned to you.`,
          time: formatRelativeTimeFromIso(generatedAt),
          kind: 'maintenance',
          href: '/staff/tasks',
        });
      }

      if (ops && ops.dutiesToday > 0) {
        nextNotifications.push({
          id: 'duties-today',
          title: 'Duty roster',
          body: `${ops.dutiesToday} duty assignment(s) on your schedule today.`,
          time: formatRelativeTimeFromIso(generatedAt),
          kind: 'duty',
          href: '/staff/schedule',
        });
      }

      const storeRows = storeRes.inbox?.items ?? [];
      const skipComplaintDerived = storeInboxCoversCategory(storeRows, 'complaint', { unreadOnly: true });

      const nameParts = displayName
        .toLowerCase()
        .split(/\s+/)
        .filter((part) => part.length > 2);
      if (!skipComplaintDerived) {
        for (const ticket of complaintsRes.tickets ?? []) {
        if (['Resolved', 'Rejected'].includes(ticket.status)) continue;
        if (!['Assigned', 'In Progress'].includes(ticket.status)) continue;
        const assignee = ticket.assignedStaff?.toLowerCase() ?? '';
        if (!assignee) continue;
        const matchesMe = nameParts.some((part) => assignee.includes(part));
        if (!matchesMe) continue;
        nextNotifications.push({
          id: `cmp-${ticket.id}`,
          title: ticket.status === 'Assigned' ? 'New assignment' : 'Work order update',
          body: `${ticket.title} — ${ticket.location}`,
          time: formatRelativeTimeFromIso(ticket.openedAt),
          kind: 'maintenance',
          href: '/staff/tasks',
        });
        if (nextNotifications.length >= 8) break;
        }
      }

      const storeItems = storeRows.map(mapStoreNotification);
      setNotifications(mergeInboxById(storeItems, nextNotifications));
      syncReadIdsFromStoreItems(storeRows, NOTIFICATIONS_READ_KEY, setReadNotificationIds);

      const scopeNames = new Set(
        (overview?.scope.hostelNames ?? []).map((name) => name.toLowerCase()),
      );
      const scopedNotices = (noticesRes.notices ?? []).filter((notice) => {
        if (notice.scope === 'University-wide') return true;
        if (scopeNames.size === 0) return true;
        return scopeNames.has(notice.scope.toLowerCase());
      });

      setMessages(
        scopedNotices.map((notice) => ({
          id: notice.id,
          from: notice.publishedBy || 'University Admin',
          role: notice.category,
          preview: notice.excerpt || notice.title,
          time: formatRelativeTimeFromIso(notice.publishedAt),
          unread: notice.status === 'Live',
          href: `/staff/announcements/${notice.id}`,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, [displayName, hostelFilter]);

  useEffect(() => {
    setLoading(true);
    void loadInbox();
    const interval = window.setInterval(() => {
      void loadInbox();
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadInbox();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadInbox]);

  const notificationUnreadCount = useMemo(
    () => notifications.filter((item) => !readNotificationIds.has(item.id)).length,
    [notifications, readNotificationIds],
  );

  const messageUnreadCount = useMemo(
    () => messages.filter((item) => item.unread && !readMessageIds.has(item.id)).length,
    [messages, readMessageIds],
  );

  const markNotificationRead = useCallback((id: string) => {
    markTopbarNotificationRead(id, NOTIFICATIONS_READ_KEY, setReadNotificationIds);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    markAllTopbarNotificationsRead(
      notifications.map((item) => item.id),
      NOTIFICATIONS_READ_KEY,
      setReadNotificationIds,
    );
  }, [notifications]);

  const markMessageRead = useCallback((id: string) => {
    setReadMessageIds((current) => {
      const next = new Set(current).add(id);
      saveTopbarReadSet(MESSAGES_READ_KEY, next);
      return next;
    });
  }, []);

  const search = useCallback(
    async (query: string): Promise<StaffTopbarSearchHit[]> => {
      const q = query.trim();
      if (q.length < 2) return [];
      const [complaints, notices] = await Promise.all([
        fetchComplaintsDeskTickets({ limit: 6, q, hostel: hostelFilter }),
        fetchAnnouncementsDeskNotices({ limit: 6, q, status: 'Live' }),
      ]);
      const hits: StaffTopbarSearchHit[] = [];
      for (const row of complaints.tickets ?? []) {
        hits.push({
          id: `wo-${row.id}`,
          category: 'Maintenance',
          label: row.title,
          hint: `${row.location} · ${row.status}`,
          href: '/staff/maintenance',
        });
      }
      for (const row of notices.notices ?? []) {
        hits.push({
          id: `ann-${row.id}`,
          category: 'Notices',
          label: row.title,
          hint: row.scope,
          href: `/staff/announcements/${row.id}`,
        });
      }
      return hits;
    },
    [hostelFilter],
  );

  return {
    notifications,
    messages,
    notificationUnreadCount,
    messageUnreadCount,
    readNotificationIds,
    readMessageIds,
    markNotificationRead,
    markAllNotificationsRead,
    markMessageRead,
    search,
    loading,
    refresh: loadInbox,
  };
}