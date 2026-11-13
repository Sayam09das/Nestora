'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type { WardenDashboardSnapshot, WardenIncidentRow } from '@/components/dashboard/warden/home/warden-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function severityVariant(severity: WardenIncidentRow['severity']) {
  if (severity === 'Critical' || severity === 'High') return 'destructive' as const;
  return 'outline' as const;
}

type Props = { snapshot: WardenDashboardSnapshot };

export function WardenDashboardIncidentsPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const { incidents } = snapshot;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--destructive)_18%,var(--border))] bg-[color-mix(in_oklch,var(--destructive)_4%,var(--card))] p-5 shadow-sm"
      aria-labelledby="warden-incidents-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="warden-incidents-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Active incidents
          </h2>
          <p className="text-sm text-muted-foreground">Security, discipline, and emergency reports</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
          <AlertTriangle className="size-3.5" aria-hidden />
          {incidents.activeCount} active
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {incidents.items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border/80 bg-card/80 px-4 py-6 text-center text-sm text-muted-foreground">
            No open incidents for your hostel.
          </li>
        ) : (
          incidents.items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/warden/incidents/${item.id}`}
                className={cn(
                  'block rounded-xl border border-border/70 bg-card/95 px-3 py-3',
                  'transition-[border-color,box-shadow] hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:shadow-sm',
                  focusRing,
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <Badge variant={severityVariant(item.severity)} className="text-[10px] font-semibold uppercase">
                    {item.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.status} · Reported {item.reportedAt}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>

      <Link
        href="/warden/incidents"
        className={cn(
          'mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-[var(--nestora-sage)] hover:text-[var(--nestora-forest)]',
          focusRing,
        )}
      >
        Open incident desk
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </motion.section>
  );
}
