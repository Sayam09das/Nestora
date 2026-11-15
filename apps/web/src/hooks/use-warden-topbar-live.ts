'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchAnnouncementsDeskNotices } from '@/lib/api/announcements';
import { fetchComplaintsDeskTickets } from '@/lib/api/complaints';
import { fetchWardenDashboardOverview } from '@/lib/api/dashboard';
import { fetchNotificationInbox, type NotificationRow } from '@/lib/api/notifications';
import { fetchRoomDirectoryList } from '@/lib/api/rooms';
import { fetchStudentDirectoryList } from '@/lib/api/students';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import {
  formatTopbarNotificationTime,
  loadTopbarReadSet,
  mapNotificationCategory,
  markAllTopbarNotificationsRead,
  markTopbarNotificationRead,
  mergeInboxById,
  saveTopbarReadSet,
  storeActionLabel,
  storeInboxCoversCategory,
  syncReadIdsFromStoreItems,
} from '@/lib/topbar/notification-store-inbox';

const LIVE_POLL_MS = 20_000;
const NOTIFICATIONS_READ_KEY = 'nestora-warden-notifications-read';
const MESSAGES_READ_KEY = 'nestora-warden-messages-read';

export type WardenTopbarNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'complaint' | 'alert' | 'leave' | 'incident' | 'notice';
  href?: string;
  actionLabel?: string;
};

export type WardenTopbarMessage = {
  id: string;
  from: string;
  role: string;
  preview: string;
  time: string;
  unread: boolean;
  href?: string;
};

export type WardenTopbarSearchHit = {
  id: string;
  category: 'Students' | 'Rooms' | 'Complaints';
  label: string;
  hint: string;
  href: string;
};

function mapStoreNotification(row: NotificationRow): WardenTopbarNotification {
  const kinds = mapNotificationCategory(row.category);
  return {
    id: row.id,
    title: row.title,
    body: row.message,
    time: formatTopbarNotificationTime(row.createdAt),
    kind: kinds.warden,
    href: row.actionLink ?? undefined,
    actionLabel: storeActionLabel(row.actionLink),
  };
}

type Options = {
  selectedHostelId: string;
  hostelName: string;
};

export function useWardenTopbarLive({ selectedHostelId, hostelName }: Options) {
  const [notifications, setNotifications] = useState<WardenTopbarNotification[]>([]);
  const [messages, setMessages] = useState<WardenTopbarMessage[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() =>
    loadTopbarReadSet(NOTIFICATIONS_READ_KEY),
  );
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(() => loadTopbarReadSet(MESSAGES_READ_KEY));
  const [loading, setLoading] = useState(true);

  const scopedHostelId = selectedHostelId.trim() || undefined;

  const loadInbox = useCallback(async () => {
    const hostelFilter = hostelName && hostelName !== 'Assigned hostel' ? hostelName : undefined;
    try {
      const [overview, complaints, notices, storeRes] = await Promise.all([
        fetchWardenDashboardOverview(scopedHostelId ? { hostelId: scopedHostelId } : undefined),
        fetchComplaintsDeskTickets({
          limit: 8,
          hostel: hostelFilter,
        }),
        fetchAnnouncementsDeskNotices({ limit: 8, status: 'Live' }),
        fetchNotificationInbox({ limit: 25 }),
      ]);

      const storeRows = storeRes.inbox?.items ?? [];
      const skipComplaintDerived = storeInboxCoversCategory(storeRows, 'complaint', { unreadOnly: true });
      const skipLeaveSummary = storeInboxCoversCategory(storeRows, 'leave', { unreadOnly: true });

      const nextNotifications: WardenTopbarNotification[] = [];
      if (!skipComplaintDerived) {
        for (const ticket of complaints.tickets ?? []) {
        if (['Resolved', 'Rejected'].includes(ticket.status)) continue;
        nextNotifications.push({
          id: `cmp-${ticket.id}`,
          title: 'Complaint ticket',
          body: `${ticket.title} — ${ticket.location}`,
          time: formatRelativeTimeFromIso(ticket.openedAt),
          kind: 'complaint',
          href: `/warden/complaints/${ticket.id}`,
          actionLabel: 'Open ticket',
        });
        }
      }

      const approvals = overview.overview?.approvals;
      if (!skipLeaveSummary && approvals && approvals.leaveRequests > 0) {
        nextNotifications.push({
          id: 'pending-leave',
          title: 'Leave requests',
          body: `${approvals.leaveRequests} leave application(s) awaiting your review.`,
          time: formatRelativeTimeFromIso(overview.overview?.generatedAt ?? new Date().toISOString()),
          kind: 'alert',
          href: '/warden/leave',
          actionLabel: 'Review',
        });
      }
      if (approvals && approvals.pendingOutings > 0) {
        nextNotifications.push({
          id: 'pending-outings',
          title: 'Outing requests',
          body: `${approvals.pendingOutings} outing form(s) awaiting approval.`,
          time: formatRelativeTimeFromIso(overview.overview?.generatedAt ?? new Date().toISOString()),
          kind: 'alert',
          href: '/warden/leave',
          actionLabel: 'Review',
        });
      }
      if (approvals && approvals.pendingAdmissions > 0) {
        nextNotifications.push({
          id: 'pending-admissions',
          title: 'Admission queue',
          body: `${approvals.pendingAdmissions} approved admission(s) still need bed allocation.`,
          time: formatRelativeTimeFromIso(overview.overview?.generatedAt ?? new Date().toISOString()),
          kind: 'alert',
          href: '/warden/students',
          actionLabel: 'Open queue',
        });
      }

      const storeItems = storeRows.map(mapStoreNotification);
      setNotifications(mergeInboxById(storeItems, nextNotifications));
      syncReadIdsFromStoreItems(storeRows, NOTIFICATIONS_READ_KEY, setReadNotificationIds);

      const scopedNotices = (notices.notices ?? []).filter((notice) => {
        if (notice.scope === 'University-wide') return true;
        if (!hostelFilter) return true;
        return notice.scope.toLowerCase() === hostelFilter.toLowerCase();
      });

      setMessages(
        scopedNotices.map((notice) => ({
          id: notice.id,
          from: notice.publishedBy || 'University Admin',
          role: notice.category,
          preview: notice.excerpt || notice.title,
          time: formatRelativeTimeFromIso(notice.publishedAt),
          unread: notice.status === 'Live',
          href: `/warden/announcements/${notice.id}`,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, [hostelName, scopedHostelId]);

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
    async (query: string): Promise<WardenTopbarSearchHit[]> => {
      const q = query.trim();
      if (q.length < 2) return [];
      const hostelFilter = hostelName && hostelName !== 'Assigned hostel' ? hostelName : undefined;
      const [students, rooms, complaints] = await Promise.all([
        fetchStudentDirectoryList({ page: 1, limit: 6, q, hostel: hostelFilter }),
        fetchRoomDirectoryList({ page: 1, limit: 6, q, hostel: hostelFilter }),
        fetchComplaintsDeskTickets({ limit: 6, q, hostel: hostelFilter }),
      ]);

      const hits: WardenTopbarSearchHit[] = [];
      for (const row of students.students ?? []) {
        hits.push({
          id: `stu-${row.id}`,
          category: 'Students',
          label: row.name,
          hint: `${row.studentId} · ${row.room || 'No room'}`,
          href: `/warden/students/${row.id}`,
        });
      }
      for (const row of rooms.rooms ?? []) {
        hits.push({
          id: `room-${row.id}`,
          category: 'Rooms',
          label: `${row.roomNumber} ${row.roomType}`,
          hint: `${row.hostel} · ${row.occupiedBeds}/${row.capacity} occupied`,
          href: '/warden/rooms',
        });
      }
      for (const row of complaints.tickets ?? []) {
        hits.push({
          id: `cmp-${row.id}`,
          category: 'Complaints',
          label: row.title,
          hint: `${row.hostel} · ${row.status}`,
          href: `/warden/complaints/${row.id}`,
        });
      }
      return hits;
    },
    [hostelName],
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
