'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchStudentDashboardOverview, type StudentDashboardOverview } from '@/lib/api/dashboard';

const LIVE_POLL_MS = 20_000;
const NOTIFICATIONS_READ_KEY = 'nestora-student-notifications-read';
const MESSAGES_READ_KEY = 'nestora-student-messages-read';

export type StudentTopbarNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'leave' | 'announcement' | 'complaint' | 'maintenance' | 'fee' | 'notice';
  href?: string;
};

export type StudentTopbarMessage = {
  id: string;
  from: string;
  role: string;
  preview: string;
  time: string;
  unread: boolean;
  href?: string;
};

export type StudentTopbarSearchHit = {
  id: string;
  category: 'Notices' | 'Complaints' | 'Leave' | 'Fees' | 'Services';
  label: string;
  hint: string;
  href: string;
};

function loadReadSet(key: string): Set<string> {
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

function saveReadSet(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function buildInboxFromOverview(overview: StudentDashboardOverview): {
  notifications: StudentTopbarNotification[];
  messages: StudentTopbarMessage[];
  defaultSearchHits: StudentTopbarSearchHit[];
} {
  const notifications: StudentTopbarNotification[] = [];

  for (const row of overview.leave.recent.slice(0, 6)) {
    const kind: StudentTopbarNotification['kind'] = 'leave';
    const title =
      row.status === 'pending'
        ? 'Leave request pending'
        : row.status === 'approved'
          ? 'Leave request approved'
          : 'Leave request update';
    notifications.push({
      id: `leave-${row.id}`,
      title,
      body: `${row.title} — ${row.statusNote || row.dateRange}`,
      time: row.dateRange,
      kind,
      href: '/student/leave',
    });
  }

  for (const row of overview.complaints.slice(0, 6)) {
    if (row.status === 'resolved') continue;
    notifications.push({
      id: `cmp-${row.id}`,
      title: row.status === 'open' ? 'Complaint submitted' : 'Complaint status update',
      body: `${row.title} — ${row.location}`,
      time: row.statusLabel,
      kind: row.status === 'in_progress' ? 'maintenance' : 'complaint',
      href: '/student/complaints',
    });
  }

  for (const row of overview.roomRequests.slice(0, 4)) {
    if (row.status !== 'pending' && row.status !== 'in_progress') continue;
    notifications.push({
      id: `rr-${row.id}`,
      title: row.typeLabel,
      body: row.description,
      time: row.statusLabel,
      kind: 'maintenance',
      href: '/student/room',
    });
  }

  if (overview.fees.available && overview.fees.outstanding > 0) {
    const due = overview.fees.dueDate ? ` Due ${overview.fees.dueDate}.` : '';
    notifications.push({
      id: 'fee-outstanding',
      title: 'Fee reminder',
      body: `Outstanding hostel fee: ₹${overview.fees.outstanding.toLocaleString('en-IN')}.${due}`,
      time: overview.fees.dueDate ?? 'Open',
      kind: 'fee',
      href: '/student/fees',
    });
  }

  if (overview.navBadges.visitors > 0) {
    notifications.push({
      id: 'visitors-pending',
      title: 'Visitor updates',
      body: `${overview.navBadges.visitors} visitor request(s) need your attention.`,
      time: 'Live',
      kind: 'notice',
      href: '/student/visitors',
    });
  }

  for (const row of overview.announcements.slice(0, 8)) {
    notifications.push({
      id: `ann-${row.id}`,
      title: row.title,
      body: row.body,
      time: row.relativeTime,
      kind: 'announcement',
      href: '/student/announcements',
    });
  }

  const messages: StudentTopbarMessage[] = overview.announcements.slice(0, 10).map((row) => ({
    id: row.id,
    from: row.author || 'Hostel office',
    role: 'Announcement',
    preview: row.body || row.title,
    time: row.relativeTime,
    unread: true,
    href: '/student/announcements',
  }));

  const defaultSearchHits: StudentTopbarSearchHit[] = [];
  for (const row of overview.announcements.slice(0, 5)) {
    defaultSearchHits.push({
      id: `ann-${row.id}`,
      category: 'Notices',
      label: row.title,
      hint: row.relativeTime,
      href: '/student/announcements',
    });
  }
  for (const row of overview.complaints.slice(0, 4)) {
    defaultSearchHits.push({
      id: `cmp-${row.id}`,
      category: 'Complaints',
      label: row.title,
      hint: `${row.location} · ${row.statusLabel}`,
      href: '/student/complaints',
    });
  }
  for (const row of overview.leave.recent.slice(0, 3)) {
    defaultSearchHits.push({
      id: `leave-${row.id}`,
      category: 'Leave',
      label: row.title,
      hint: row.dateRange,
      href: '/student/leave',
    });
  }
  if (overview.fees.available) {
    defaultSearchHits.push({
      id: 'fees-desk',
      category: 'Fees',
      label: 'Hostel fees',
      hint:
        overview.fees.outstanding > 0
          ? `₹${overview.fees.outstanding.toLocaleString('en-IN')} outstanding`
          : 'No outstanding balance',
      href: '/student/fees',
    });
  }

  return { notifications, messages, defaultSearchHits };
}

export function useStudentTopbarLive() {
  const [notifications, setNotifications] = useState<StudentTopbarNotification[]>([]);
  const [messages, setMessages] = useState<StudentTopbarMessage[]>([]);
  const [defaultSearchHits, setDefaultSearchHits] = useState<StudentTopbarSearchHit[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() =>
    loadReadSet(NOTIFICATIONS_READ_KEY),
  );
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(() => loadReadSet(MESSAGES_READ_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestOverview, setLatestOverview] = useState<StudentDashboardOverview | null>(null);

  const loadInbox = useCallback(async () => {
    try {
      const res = await fetchStudentDashboardOverview();
      if (res.overview) {
        setError(null);
      } else if (res.error) {
        setError(res.error);
      }
      const overview = res.overview;
      if (!overview) return;
      setLatestOverview(overview);
      const inbox = buildInboxFromOverview(overview);
      setNotifications(inbox.notifications);
      setMessages(inbox.messages);
      setDefaultSearchHits(inbox.defaultSearchHits);
    } catch {
      setError('Unable to reach the API.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    setReadNotificationIds((current) => {
      const next = new Set(current).add(id);
      saveReadSet(NOTIFICATIONS_READ_KEY, next);
      return next;
    });
  }, []);

  const markMessageRead = useCallback((id: string) => {
    setReadMessageIds((current) => {
      const next = new Set(current).add(id);
      saveReadSet(MESSAGES_READ_KEY, next);
      return next;
    });
  }, []);

  const search = useCallback(
    async (query: string): Promise<StudentTopbarSearchHit[]> => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return defaultSearchHits;

      let overview = latestOverview;
      if (!overview) {
        const res = await fetchStudentDashboardOverview();
        overview = res.overview ?? null;
        if (overview) setLatestOverview(overview);
      }
      if (!overview) return [];

      const hits: StudentTopbarSearchHit[] = [];
      const match = (text: string) => text.toLowerCase().includes(q);

      for (const row of overview.announcements) {
        if (!match(row.title) && !match(row.body)) continue;
        hits.push({
          id: `ann-${row.id}`,
          category: 'Notices',
          label: row.title,
          hint: row.relativeTime,
          href: '/student/announcements',
        });
      }
      for (const row of overview.complaints) {
        if (!match(row.title) && !match(row.location)) continue;
        hits.push({
          id: `cmp-${row.id}`,
          category: 'Complaints',
          label: row.title,
          hint: `${row.location} · ${row.statusLabel}`,
          href: '/student/complaints',
        });
      }
      for (const row of overview.leave.recent) {
        if (!match(row.title) && !match(row.statusNote)) continue;
        hits.push({
          id: `leave-${row.id}`,
          category: 'Leave',
          label: row.title,
          hint: row.dateRange,
          href: '/student/leave',
        });
      }
      for (const row of overview.roomRequests) {
        if (!match(row.description) && !match(row.typeLabel)) continue;
        hits.push({
          id: `rr-${row.id}`,
          category: 'Services',
          label: row.typeLabel,
          hint: row.statusLabel,
          href: '/student/room',
        });
      }
      if (match('fee') || match('payment') || match('dues')) {
        hits.push({
          id: 'fees-desk',
          category: 'Fees',
          label: 'Hostel fees',
          hint:
            overview.fees.outstanding > 0
              ? `₹${overview.fees.outstanding.toLocaleString('en-IN')} outstanding`
              : 'Fee desk',
          href: '/student/fees',
        });
      }

      return hits.slice(0, 12);
    },
    [defaultSearchHits, latestOverview],
  );

  return {
    notifications,
    messages,
    notificationUnreadCount,
    messageUnreadCount,
    readNotificationIds,
    readMessageIds,
    markNotificationRead,
    markMessageRead,
    search,
    defaultSearchHits,
    loading,
    error,
    refresh: loadInbox,
    latestOverview,
  };
}