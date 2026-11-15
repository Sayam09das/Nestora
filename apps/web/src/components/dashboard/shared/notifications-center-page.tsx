'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  fetchNotificationInbox,
  isStoreNotificationId,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  type NotificationRow,
} from '@/lib/api/notifications';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { homeHref: string; title?: string };

export function NotificationsCenterPage({ homeHref, title = 'Notifications' }: Props) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchNotificationInbox({ limit: 50 });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setItems(result.inbox?.items ?? []);
    setUnreadCount(result.inbox?.unreadCount ?? 0);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    if (!isStoreNotificationId(id)) return;
    const result = await markNotificationReadApi(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, isRead: true } : row)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    const result = await markAllNotificationsReadApi();
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setItems((prev) => prev.map((row) => ({ ...row, isRead: true })));
    setUnreadCount(0);
    toast.success('All caught up');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-[var(--nestora-forest)]">
            <Bell className="size-5" aria-hidden />
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'Inbox up to date'} · MOD-07 center
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => void markAll()} disabled={unreadCount === 0}>
            <CheckCheck className="size-4" aria-hidden />
            Mark all read
          </Button>
          <Link
            href={homeHref}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium hover:bg-muted',
              focusRing,
            )}
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading inbox…
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((row) => (
            <li
              key={row.id}
              className={cn(
                'rounded-2xl border p-4 shadow-sm',
                row.isRead ? 'border-border bg-card' : 'border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage)_6%,var(--card))]',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{row.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{row.message}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {row.category} · {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.createdAt))}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {row.actionLink ? (
                    <Link href={row.actionLink} className={cn('text-xs font-semibold text-[var(--nestora-forest)] underline-offset-2 hover:underline', focusRing)}>
                      Open
                    </Link>
                  ) : null}
                  {!row.isRead && isStoreNotificationId(row.id) ? (
                    <Button type="button" size="sm" variant="ghost" className="h-8 rounded-lg text-xs" onClick={() => void markRead(row.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}