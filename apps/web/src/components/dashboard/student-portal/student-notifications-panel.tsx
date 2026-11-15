'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Loader2,
  Megaphone,
  Plane,
  Wrench,
  MessageSquareWarning,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useStudentTopbarLiveContext } from '@/components/dashboard/student-portal/student-topbar-live-provider';
import type { StudentTopbarNotification } from '@/hooks/use-student-topbar-live';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const kindStyles: Record<
  StudentTopbarNotification['kind'],
  { icon: typeof Bell; iconClass: string }
> = {
  leave: { icon: Plane, iconClass: 'text-[var(--nestora-gold)]' },
  announcement: { icon: Megaphone, iconClass: 'text-[var(--nestora-sage)]' },
  complaint: { icon: MessageSquareWarning, iconClass: 'text-[var(--nestora-forest)]' },
  maintenance: { icon: Wrench, iconClass: 'text-amber-600' },
  fee: { icon: CreditCard, iconClass: 'text-[var(--nestora-gold)]' },
  notice: { icon: Megaphone, iconClass: 'text-[var(--nestora-forest)]' },
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StudentNotificationsPanel() {
  const reduceMotion = useReducedMotion();
  const {
    notifications,
    notificationUnreadCount,
    readNotificationIds,
    markNotificationRead,
    loading,
  } = useStudentTopbarLiveContext();
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
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[9px] font-bold text-white"
          >
            {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
          </motion.span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,22.5rem)] overflow-hidden rounded-2xl border p-0 shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--nestora-forest)_45%,transparent)]"
      >
        <div className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_35%,var(--card))] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--nestora-forest)]">Updates & alerts</p>
          <p className="text-xs text-muted-foreground">Leave, notices, complaints, and fees (~20s refresh)</p>
        </div>
        <ul className="max-h-[min(60vh,22rem)] divide-y overflow-y-auto p-1">
          {loading && notifications.length === 0 ? (
            <li className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Syncing…
            </li>
          ) : notifications.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</li>
          ) : (
            notifications.map((item, index) => {
              const { icon: Icon, iconClass } = kindStyles[item.kind];
              const unread = !readNotificationIds.has(item.id);
              return (
                <motion.li
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.28, ease: motionEase }}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => {
                        markNotificationRead(item.id);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted/60',
                        unread && 'bg-[color-mix(in_oklch,var(--nestora-sage)_8%,transparent)]',
                        focusRing,
                      )}
                    >
                      <span className={cn('mt-0.5', iconClass)} aria-hidden>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                          {unread ? (
                            <span className="size-1.5 shrink-0 rounded-full bg-[var(--nestora-forest)]" aria-hidden />
                          ) : null}
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.body}</span>
                        <span className="mt-1 block text-[10px] text-muted-foreground/80">{item.time}</span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  ) : null}
                </motion.li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}