'use client';

import { Bell, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { useStaffTopbarLiveContext } from '@/components/dashboard/staff-portal/staff-topbar-live-provider';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type InboxTab = 'notices' | 'alerts';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StaffMessagesPage() {
  const { workplaceName } = useStaffShell();
  const {
    messages,
    notifications,
    messageUnreadCount,
    notificationUnreadCount,
    readMessageIds,
    readNotificationIds,
    markMessageRead,
    markNotificationRead,
    loading,
    refresh,
  } = useStaffTopbarLiveContext();

  const [tab, setTab] = useState<InboxTab>('notices');

  const hostelLabel =
    workplaceName && workplaceName !== 'Assigned hostel' && workplaceName !== 'No hostel assigned'
      ? workplaceName
      : 'your assigned hostel';

  const visibleMessages = useMemo(() => messages, [messages]);
  const visibleAlerts = useMemo(() => notifications, [notifications]);

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">Messages</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live notice feed and operational alerts for {hostelLabel}. Same inbox as the top bar — refreshes every 20
            seconds.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('shrink-0 gap-2', focusRing)}
          disabled={loading}
          onClick={() => refresh()}
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          Refresh
        </Button>
      </header>

      <StaffDashboardLiveStatus
        loading={loading}
        error={null}
        refresh={refresh}
        hasOverview={!loading || visibleMessages.length > 0 || visibleAlerts.length > 0}
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Inbox sections">
        {(
          [
            { id: 'notices' as const, label: 'Notices', count: messageUnreadCount, icon: MessageCircle },
            { id: 'alerts' as const, label: 'Work alerts', count: notificationUnreadCount, icon: Bell },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                focusRing,
                active
                  ? 'border-[var(--nestora-forest)] bg-[var(--nestora-forest)] text-white'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {item.label}
              {item.count > 0 ? (
                <span className="rounded-full bg-white/20 px-1.5 tabular-nums">{item.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {loading && visibleMessages.length === 0 && visibleAlerts.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Syncing inbox…
        </div>
      ) : null}

      {tab === 'notices' ? (
        <section
          className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card shadow-sm"
          aria-labelledby="staff-messages-notices-heading"
        >
          <h2 id="staff-messages-notices-heading" className="border-b border-border px-4 py-3 text-sm font-semibold text-[var(--nestora-forest)]">
            Live notices
          </h2>
          {visibleMessages.length === 0 && !loading ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              No live notices for your hostel. Check the{' '}
              <Link href="/staff/announcements" className="font-medium text-[var(--nestora-forest)] underline-offset-2 hover:underline">
                announcements desk
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {visibleMessages.map((msg) => {
                const unread = msg.unread && !readMessageIds.has(msg.id);
                const content = (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{msg.from}</p>
                      <p className="text-xs text-[var(--nestora-sage)]">{msg.role}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{msg.preview}</p>
                    </div>
                    <time className="shrink-0 text-xs tabular-nums text-muted-foreground">{msg.time}</time>
                  </div>
                );
                const rowClass = cn(
                  'block w-full px-4 py-4 transition-colors',
                  unread ? 'bg-[color-mix(in_oklch,var(--nestora-sage)_6%,var(--card))]' : 'bg-card',
                );

                return (
                  <li key={msg.id}>
                    {msg.href ? (
                      <Link href={msg.href} onClick={() => markMessageRead(msg.id)} className={cn(rowClass, focusRing)}>
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markMessageRead(msg.id)}
                        className={cn(rowClass, 'text-left', focusRing)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : (
        <section
          className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card shadow-sm"
          aria-labelledby="staff-messages-alerts-heading"
        >
          <h2 id="staff-messages-alerts-heading" className="border-b border-border px-4 py-3 text-sm font-semibold text-[var(--nestora-forest)]">
            Work alerts
          </h2>
          {visibleAlerts.length === 0 && !loading ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No operational alerts right now.</p>
          ) : (
            <ul className="divide-y divide-border">
              {visibleAlerts.map((item) => {
                const unread = !readNotificationIds.has(item.id);
                const inner = (
                  <>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                    <time className="mt-2 block text-xs text-muted-foreground">{item.time}</time>
                  </>
                );
                const className = cn(
                  'block w-full px-4 py-4 text-left transition-colors',
                  unread ? 'bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))]' : 'bg-card',
                );
                return (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => markNotificationRead(item.id)}
                        className={cn(className, focusRing)}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(item.id)}
                        className={cn(className, focusRing)}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}