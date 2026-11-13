'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import type { DailyRegisterCategory, DailyRegisterEntry } from '@/lib/api/daily-register';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORY_STYLES: Record<DailyRegisterCategory, string> = {
  Attendance: 'text-sky-700 border-sky-200',
  Movement: 'text-violet-700 border-violet-200',
  Visitor: 'text-amber-800 border-amber-200',
  Leave: 'text-teal-800 border-teal-200',
  Complaint: 'text-orange-800 border-orange-200',
  Incident: 'text-rose-800 border-rose-200',
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  entries: DailyRegisterEntry[];
  listKey: string;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function WardenDailyRegisterTimeline({ entries, listKey }: Props) {
  const reduceMotion = useReducedMotion();

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center text-sm text-muted-foreground">
        No register entries for this date and filter. Activity will appear here as residents move, visitors arrive, and
        desk actions are logged.
      </div>
    );
  }

  return (
    <ol key={listKey} className="space-y-0 rounded-2xl border bg-card shadow-sm">
      {entries.map((entry, i) => (
        <motion.li
          key={entry.id}
          initial={reduceMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i * 0.02, 0.2) }}
          className="relative flex gap-4 border-b px-4 py-4 last:border-0 sm:px-5"
        >
          <div className="w-14 shrink-0 pt-0.5 text-right text-xs font-semibold tabular-nums text-muted-foreground">
            {formatTime(entry.occurredAt)}
          </div>
          <div className="relative min-w-0 flex-1 pl-2 before:absolute before:-left-2 before:top-0 before:h-full before:w-px before:bg-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]">
            <Badge variant="outline" className={cn('mb-2 rounded-full text-[10px]', CATEGORY_STYLES[entry.category])}>
              {entry.category}
            </Badge>
            <p className="text-sm font-semibold text-[var(--nestora-forest)]">{entry.headline}</p>
            <p className="mt-1 text-xs text-muted-foreground">{entry.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              {entry.resident ? <span>Resident · {entry.resident}</span> : null}
              {entry.location ? <span>{entry.location}</span> : null}
              {entry.linkPath ? (
                <Link
                  href={entry.linkPath}
                  className={cn(
                    'inline-flex items-center gap-0.5 font-semibold text-[var(--nestora-forest)]',
                    focusRing,
                  )}
                >
                  Open record
                  <ArrowUpRight className="size-3" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
