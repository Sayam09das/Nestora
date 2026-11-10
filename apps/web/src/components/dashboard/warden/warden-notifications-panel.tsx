'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bell, ChevronRight, MessageSquareWarning, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Kind = 'complaint' | 'alert';

type Item = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: Kind;
  href?: string;
  actionLabel?: string;
};

const initial: Item[] = [
  {
    id: '1',
    title: 'New complaint',
    body: 'Water pressure — B block needs priority review.',
    time: '6m ago',
    kind: 'complaint',
    href: '/warden/complaints',
    actionLabel: 'Open ticket',
  },
  {
    id: '2',
    title: 'Leave request',
    body: '3 weekend outing forms awaiting approval.',
    time: '22m ago',
    kind: 'alert',
    href: '/warden/leave',
    actionLabel: 'Review',
  },
  {
    id: '3',
    title: 'Late return alert',
    body: 'Student flagged after curfew — room A-118.',
    time: '1h ago',
    kind: 'alert',
    href: '/warden',
    actionLabel: 'View resident',
  },
];

const kindStyles: Record<Kind, { icon: typeof ShieldAlert; iconClass: string; surfaceClass: string }> = {
  complaint: {
    icon: MessageSquareWarning,
    iconClass: 'text-[var(--nestora-gold)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-gold)_28%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))]',
  },
  alert: {
    icon: ShieldAlert,
    iconClass: 'text-[var(--nestora-sage)]',
    surfaceClass:
      'border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]',
  },
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenNotificationsPanel() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [items] = useState(initial);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const unreadCount = useMemo(() => items.filter((item) => !readIds.has(item.id)).length, [items, readIds]);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(items.map((item) => item.id)));
  }, [items]);

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
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--nestora-gold)] text-[9px] font-bold text-[var(--nestora-forest-dark)]"
          >
            {unreadCount}
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
              <p className="mt-0.5 text-[11px] text-muted-foreground">Complaints, alerts & requests</p>
            </div>
            {unreadCount > 0 ? (
              <button type="button" onClick={markAllRead} className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', focusRing)}>
                Mark all read
              </button>
            ) : null}
          </div>
        </div>

        <ul className="max-h-72 space-y-2 overflow-y-auto p-3">
          {items.map((item, index) => {
            const unread = !readIds.has(item.id);
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
                            markRead(item.id);
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
