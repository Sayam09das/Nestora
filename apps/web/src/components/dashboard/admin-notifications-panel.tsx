'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bell, ChevronRight, FileCheck, Loader2, MessageSquareWarning, Plane, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAdminNotificationsLive, type AdminTopbarNotification } from '@/hooks/use-admin-notifications-live';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const kindStyles: Record<
  AdminTopbarNotification['kind'],
  { icon: typeof ShieldAlert; iconClass: string; surfaceClass: string }
> = {
  alert: {
    icon: ShieldAlert,
    iconClass: 'text-[var(--nestora-gold)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-gold)_28%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))]',
  },
  audit: {
    icon: FileCheck,
    iconClass: 'text-[var(--nestora-sage)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]',
  },
  leave: {
    icon: Plane,
    iconClass: 'text-[var(--nestora-forest)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-forest)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_6%,var(--card))]',
  },
  complaint: {
    icon: MessageSquareWarning,
    iconClass: 'text-amber-700',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_8%,var(--card))]',
  },
  incident: {
    icon: ShieldAlert,
    iconClass: 'text-destructive',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--destructive)_28%,var(--border))] bg-[color-mix(in_oklch,var(--destructive)_8%,var(--card))]',
  },
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const listItem = {
  hidden: { opacity: 0, y: 6 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * index, duration: 0.32, ease: motionEase },
  }),
};

export function AdminNotificationsPanel() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, readIds, markRead, markAllRead, loading } = useAdminNotificationsLive();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
          'transition-colors hover:bg-muted/80',
          focusRing,
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="size-4" aria-hidden />
        {unreadCount > 0 ? (
          <motion.span
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--nestora-gold)] text-[9px] font-bold text-[var(--nestora-forest-dark)] shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,22.5rem)] overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-0 shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--nestora-forest)_45%,transparent)]"
      >
        <div className="border-b border-border bg-[color-mix(in_oklch,var(--nestora-cream)_35%,var(--card))] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold tracking-tight text-[var(--nestora-forest)]">Notifications</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">MOD-07 inbox + university queue (~20s refresh)</p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[var(--nestora-forest)]',
                  'bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--muted))] hover:bg-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--muted))]',
                  focusRing,
                )}
              >
                Mark all read
              </button>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                All caught up
              </span>
            )}
          </div>
        </div>

        <ul className="max-h-72 space-y-2 overflow-y-auto p-3">
          {loading && notifications.length === 0 ? (
            <li className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Syncing…
            </li>
          ) : null}
          {!loading && notifications.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">No new alerts right now.</li>
          ) : null}
          {notifications.map((item, index) => {
            const unread = !readIds.has(item.id);
            const style = kindStyles[item.kind];
            const Icon = style.icon;
            return (
              <motion.li
                key={item.id}
                custom={index}
                variants={listItem}
                initial={reduceMotion || !open ? false : 'hidden'}
                animate={open ? 'show' : false}
              >
                <article
                  className={cn(
                    'group relative overflow-hidden rounded-xl border p-3 transition-[border-color,box-shadow,transform] duration-200',
                    style.surfaceClass,
                    unread
                      ? 'shadow-sm ring-1 ring-[color-mix(in_oklch,var(--nestora-sage)_12%,transparent)]'
                      : 'opacity-85',
                    'hover:shadow-md motion-reduce:hover:shadow-sm',
                  )}
                >
                  {unread ? (
                    <span
                      className="absolute right-3 top-3 size-2 rounded-full bg-[var(--nestora-gold)]"
                      aria-hidden
                    />
                  ) : null}

                  <div className="flex gap-3 pr-4">
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80',
                        style.iconClass,
                      )}
                    >
                      <Icon className="size-4" aria-hidden strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-caption font-semibold leading-snug text-foreground">{item.title}</h3>
                        <time className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{item.time}</time>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.body}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {item.href && item.actionLabel ? (
                          <Link
                            href={item.href}
                            onClick={() => {
                              markRead(item.id);
                              setOpen(false);
                            }}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full bg-[var(--nestora-forest)] px-2.5 py-1 text-[10px] font-semibold text-white',
                              'transition-colors hover:bg-[color-mix(in_oklch,var(--nestora-forest),white_12%)]',
                              focusRing,
                            )}
                          >
                            {item.actionLabel}
                            <ChevronRight className="size-3" aria-hidden />
                          </Link>
                        ) : null}
                        {unread ? (
                          <button
                            type="button"
                            onClick={() => markRead(item.id)}
                            className={cn(
                              'text-[10px] font-semibold text-[var(--nestora-sage)] underline-offset-2 hover:underline',
                              focusRing,
                            )}
                          >
                            Dismiss
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>

        <div className="border-t border-border bg-muted/30 px-4 py-2.5">
          <Link
            href="/admin/audit-logs"
            onClick={() => setOpen(false)}
            className={cn(
              'flex w-full items-center justify-center gap-1 text-[11px] font-semibold text-[var(--nestora-forest)]',
              'hover:text-[color-mix(in_oklch,var(--nestora-forest),white_15%)]',
              focusRing,
            )}
          >
            View audit activity
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}