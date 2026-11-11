'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Megaphone,
  Plane,
  Wrench,
  MessageSquareWarning,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Kind = 'leave' | 'announcement' | 'complaint' | 'maintenance' | 'fee' | 'notice';

type Item = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: Kind;
  href?: string;
};

const initial: Item[] = [
  {
    id: '1',
    title: 'Leave request approved',
    body: 'Your weekend outing leave has been approved.',
    time: '12m ago',
    kind: 'leave',
    href: '/student/leave',
  },
  {
    id: '2',
    title: 'New hostel announcement',
    body: 'Guest visiting hours updated for Block B.',
    time: '35m ago',
    kind: 'announcement',
    href: '/student/announcements',
  },
  {
    id: '3',
    title: 'Complaint status update',
    body: 'Maintenance ticket #CMP-118 is now in progress.',
    time: '1h ago',
    kind: 'complaint',
    href: '/student/complaints',
  },
  {
    id: '4',
    title: 'Room maintenance',
    body: 'Fan repair scheduled in your corridor today, 4–6 PM.',
    time: '2h ago',
    kind: 'maintenance',
    href: '/student/complaints',
  },
  {
    id: '5',
    title: 'Fee reminder',
    body: 'Hostel fee for this term is due in 5 days.',
    time: 'Yesterday',
    kind: 'fee',
    href: '/student/fees',
  },
  {
    id: '6',
    title: 'Important notice',
    body: 'Fire drill briefing at mess hall, 5 PM today.',
    time: 'Yesterday',
    kind: 'notice',
    href: '/student/announcements',
  },
];

const kindStyles: Record<Kind, { icon: typeof Bell; iconClass: string }> = {
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
  const [open, setOpen] = useState(false);
  const [items] = useState(initial);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const unreadCount = useMemo(() => items.filter((item) => !readIds.has(item.id)).length, [items, readIds]);

  const markRead = useCallback((id: string) => {
    setReadIds((current) => new Set(current).add(id));
  }, []);

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
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[9px] font-bold text-white"
          >
            {unreadCount}
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
          <p className="text-xs text-muted-foreground">Leave, notices, complaints, and fees</p>
        </div>
        <ul className="max-h-[min(60vh,22rem)] divide-y overflow-y-auto p-1">
          {items.map((item, index) => {
            const { icon: Icon, iconClass } = kindStyles[item.kind];
            const unread = !readIds.has(item.id);
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
                      markRead(item.id);
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
                        {unread ? <span className="size-1.5 shrink-0 rounded-full bg-[var(--nestora-forest)]" aria-hidden /> : null}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.body}</span>
                      <span className="mt-1 block text-[10px] text-muted-foreground/80">{item.time}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                ) : null}
              </motion.li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
