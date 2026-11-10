'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Camera, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import {
  BOARD_COLUMN_STATUSES,
  CATEGORY_META,
  PRIORITY_STYLES,
  boardStatusForTicket,
  effectivePriority,
  formatComplaintWhen,
  slaRemainingHours,
  type ComplaintTicket,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const COLUMN_ACCENT: Record<string, string> = {
  Submitted: '#94a3b8',
  'Under Review': '#d97706',
  Assigned: '#0284c7',
  'In Progress': '#6d9773',
  Resolved: 'var(--nestora-forest)',
};

type Props = {
  tickets: ComplaintTicket[];
  listKey: string;
  hidden?: boolean;
};

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AdminComplaintsKanban({ tickets, listKey, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const byColumn = useMemo(() => {
    const map = new Map<string, ComplaintTicket[]>();
    for (const col of BOARD_COLUMN_STATUSES) map.set(col, []);
    for (const t of tickets) {
      const col = boardStatusForTicket(t.status);
      const bucket = map.get(col) ?? [];
      bucket.push(t);
      map.set(col, bucket);
    }
    return map;
  }, [tickets]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current || hidden) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-cmp-board-card]'), {
        opacity: 0,
        scale: 0.92,
        y: 16,
        duration: 0.4,
        stagger: { each: 0.05, grid: 'auto' },
        ease: 'back.out(1.2)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion, listKey, hidden] },
  );

  return (
    <section
      ref={sectionRef}
      data-cmp-reveal
      aria-label="Ticket board"
      hidden={hidden}
      className={cn(hidden && 'hidden')}
    >
      <motion.div
        key={listKey}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {BOARD_COLUMN_STATUSES.map((column) => {
          const rows = byColumn.get(column) ?? [];
          return (
            <div key={column} className="w-[min(100%,17.5rem)] shrink-0 space-y-3">
              <span className="flex items-center justify-between gap-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{column}</span>
                <Badge variant="secondary" className="rounded-full tabular-nums">
                  {rows.length}
                </Badge>
              </span>
              <span
                className="block h-1 rounded-full"
                style={{ background: COLUMN_ACCENT[column] ?? 'var(--border)' }}
                aria-hidden
              />
              <ul className="min-h-[12rem] space-y-2.5 rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_16%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_8%,var(--background))] p-2">
                <AnimatePresence initial={false}>
                  {rows.map((ticket) => (
                    <ComplaintKanbanCard key={ticket.id} ticket={ticket} />
                  ))}
                </AnimatePresence>
                {rows.length === 0 ? (
                  <li className="px-2 py-8 text-center text-xs text-muted-foreground">No tickets in this lane</li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}

function ComplaintKanbanCard({ ticket }: { ticket: ComplaintTicket }) {
  const reduceMotion = useReducedMotion();
  const meta = CATEGORY_META[ticket.category];
  const Icon = meta.icon;
  const priority = effectivePriority(ticket);
  const slaLeft = slaRemainingHours(ticket);

  return (
    <motion.li
      layout={!reduceMotion}
      data-cmp-flip
      data-cmp-board-card
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="list-none"
    >
      <Link
        href={`/admin/complaints/${ticket.id}`}
        className={cn(
          'group block cursor-pointer rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
          focusRing,
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border"
              style={{
                color: meta.accent,
                borderColor: `color-mix(in oklch, ${meta.accent} 35%, var(--border))`,
                background: `color-mix(in oklch, ${meta.accent} 12%, var(--card))`,
              }}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-muted-foreground">{ticket.ticketNumber}</p>
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--nestora-forest)]">{ticket.title}</p>
            </div>
          </div>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase', PRIORITY_STYLES[priority])}>
            {priority}
          </span>
          {ticket.hasPhoto ? (
            <span className="inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
              <Camera className="size-3" aria-hidden />
              Photo
            </span>
          ) : null}
          {ticket.slaBreached || slaLeft <= 6 ? (
            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              SLA {ticket.slaBreached ? 'breach' : `${slaLeft}h left`}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--border))] pt-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--muted))] text-[10px] font-bold text-[var(--nestora-forest)]"
              aria-hidden
            >
              {initials(ticket.studentName)}
            </span>
            <p className="truncate text-xs text-muted-foreground">
              {ticket.block} · {ticket.studentName.split(' ')[0]}
            </p>
          </div>
          <time className="shrink-0 text-[10px] text-muted-foreground" dateTime={ticket.updatedAt}>
            {formatComplaintWhen(ticket.updatedAt)}
          </time>
        </div>
      </Link>
    </motion.li>
  );
}
