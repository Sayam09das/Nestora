'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  CATEGORY_META,
  FR_HINTS,
  categorizeAction,
  formatAuditWhen,
  severityFor,
} from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import type { AuditLogRow } from '@/lib/api/audit';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const severityTone: Record<string, string> = {
  Info: 'border-l-[var(--nestora-sage)]',
  Warning: 'border-l-amber-500',
  Critical: 'border-l-red-500',
};

type Props = {
  logs: AuditLogRow[];
  selectedId: string;
  onSelect: (id: string) => void;
  listKey: string;
  hidden?: boolean;
};

export function AdminAuditLogsTimeline({ logs, selectedId, onSelect, listKey, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !listRef.current || hidden) return;
      gsap.from(listRef.current.querySelectorAll('[data-aud-card]'), {
        opacity: 0,
        x: -16,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: listRef, dependencies: [listKey, hidden, reduceMotion] },
  );

  return (
    <div
      ref={listRef}
      data-aud-reveal
      data-aud-flip
      className={cn('relative space-y-3 pl-4 sm:pl-6', hidden && 'hidden')}
      aria-hidden={hidden}
    >
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border sm:left-[11px]" aria-hidden />
      {logs.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No audit entries match filters.</p>
      ) : (
        logs.map((log) => {
          const category = categorizeAction(log.actionName);
          const meta = CATEGORY_META[category];
          const Icon = meta.icon;
          const severity = severityFor(log.actionName);
          const active = log.id === selectedId;
          const fr = FR_HINTS[log.actionName];
          return (
            <motion.article
              key={log.id}
              data-aud-flip
              data-aud-card
              layout={!reduceMotion}
              className={cn(
                'relative rounded-2xl border border-l-4 bg-card shadow-sm',
                severityTone[severity],
                active ? 'ring-2 ring-[color-mix(in_oklch,var(--nestora-sage)_25%,transparent)]' : '',
              )}
            >
              <span
                className="absolute -left-[13px] top-5 flex size-3 rounded-full border-2 border-card bg-[var(--nestora-forest)] sm:-left-[17px]"
                aria-hidden
              />
              <button type="button" onClick={() => onSelect(log.id)} className={cn('w-full p-4 text-left sm:p-5', focusRing)}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    <Icon className="size-3.5" style={{ color: meta.accent }} aria-hidden />
                    {category}
                    <time dateTime={log.timestamp}>{formatAuditWhen(log.timestamp)}</time>
                  </span>
                  {fr ? (
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {fr}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 font-mono text-sm font-semibold text-[var(--nestora-forest)]">{log.actionName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.entityType} · <span className="font-mono">{log.entityId}</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {log.actorRole}
                  {log.actorUserId ? <span className="font-mono"> · {log.actorUserId}</span> : null}
                </p>
              </button>
              <div className="border-t px-4 py-2">
                <Link
                  href={`/admin/audit-logs/${log.id}`}
                  className={cn('inline-flex items-center gap-1 text-xs font-semibold text-[var(--nestora-forest)]', focusRing)}
                >
                  Inspect entry
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </motion.article>
          );
        })
      )}
    </div>
  );
}
