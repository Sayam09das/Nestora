'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bell, ChevronRight, Loader2, MessageSquareWarning, Plane, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useWardenTopbarLiveContext } from '@/components/dashboard/warden/warden-topbar-live-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const kindStyles = {
  complaint: {
    icon: MessageSquareWarning,
    iconClass: 'text-[var(--nestora-gold)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-gold)_28%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))]',
  },
  leave: {
    icon: Plane,
    iconClass: 'text-[var(--nestora-forest)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-forest)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_6%,var(--card))]',
  },
  incident: {
    icon: ShieldAlert,
    iconClass: 'text-destructive',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--destructive)_28%,var(--border))] bg-[color-mix(in_oklch,var(--destructive)_8%,var(--card))]',
  },
  notice: {
    icon: Bell,
    iconClass: 'text-[var(--nestora-sage)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_6%,var(--card))]',
  },
  alert: {
    icon: ShieldAlert,
    iconClass: 'text-[var(--nestora-sage)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]',
  },
} as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenNotificationsPanel() {
  const reduceMotion = useReducedMotion();
  const {
    notifications,
    notificationUnreadCount,
    readNotificationIds,
    markNotificationRead,
    markAllNotificationsRead,
    loading,
  } = useWardenTopbarLiveContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
          'transition-colors hover:bg-muted/80',
          focusRing,
        )}
        aria-label={`Notifications${notificationUnreadCount > 0 ? `, ${notificationUnreadCount} unread` : ''}`}
      >
        <Bell className="size-4" aria-hidden />
        {notificationUnreadCount > 0 ? (
          <motion.span
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--nestora-gold)] text-[9px] font-bold text-[var(--nestora-forest-dark)]"
          >
            {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
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
              <p className="text-sm font-semibold text-[var(--nestora-forest)]">Notifications</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">MOD-07 inbox + live queue (~20s refresh)</p>
            </div>
            {notificationUnreadCount > 0 ? (
              <button type="button" onClick={markAllNotificationsRead} className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', focusRing)}>
                Mark all read
              </button>
            ) : null}
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
            <li className="py-6 text-center text-sm text-muted-foreground">No pending alerts in your hostel scope.</li>
          ) : null}
          {notifications.map((item, index) => {
            const unread = !readNotificationIds.has(item.id);
            const style = kindStyles[item.kind];
            const Icon = style.icon;
            return (
              <motion.li
                key={item.id}
                initial={reduceMotion || !open ? false : { opacity: 0, y: 6 }}
                animate={open ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: index * 0.04, duration: 0.32, ease: motionEase }}
              >
                <article className={cn('rounded-xl border p-3', style.surfaceClass, unread && 'shadow-sm')}>
                  <div className="flex gap-3">
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60', style.iconClass)}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <h3 className="text-caption font-semibold">{item.title}</h3>
                        <time className="text-[10px] text-muted-foreground">{item.time}</time>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{item.body}</p>
                      {item.href && item.actionLabel ? (
                        <Link
                          href={item.href}
                          onClick={() => {
                            markNotificationRead(item.id);
                            setOpen(false);
                          }}
                          className={cn(
                            'mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--nestora-forest)] px-2.5 py-1 text-[10px] font-semibold text-white',
                            focusRing,
                          )}
                        >
                          {item.actionLabel}
                          <ChevronRight className="size-3" aria-hidden />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
