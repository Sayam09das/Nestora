'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  CATEGORY_META,
  formatReportWhen,
  type ReportTemplate,
} from '@/components/dashboard/reports/admin-reports-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  reports: ReportTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
  listKey: string;
  hidden?: boolean;
};

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-8 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <i
          key={i}
          className="w-1.5 rounded-sm bg-[color-mix(in_oklch,var(--nestora-forest)_70%,var(--border))]"
          style={{ height: `${Math.round((v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function AdminReportsCatalog({ reports, selectedId, onSelect, listKey, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !gridRef.current || hidden) return;
      gsap.from(gridRef.current.querySelectorAll('[data-rpt-card]'), {
        opacity: 0,
        scale: 0.92,
        y: 14,
        stagger: { each: 0.05, grid: 'auto' },
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: gridRef, dependencies: [listKey, hidden, reduceMotion] },
  );

  return (
    <div
      ref={gridRef}
      data-rpt-reveal
      data-rpt-flip
      className={cn('grid gap-4 lg:grid-cols-2 xl:grid-cols-3', hidden && 'hidden')}
      aria-hidden={hidden}
    >
      {reports.map((report) => {
        const meta = CATEGORY_META[report.category];
        const Icon = meta.icon;
        const active = report.id === selectedId;
        return (
          <motion.article
            key={report.id}
            data-rpt-flip
            data-rpt-card
            layout={!reduceMotion}
            className={cn(
              'overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow',
              active ? 'border-[var(--nestora-forest)] ring-2 ring-[color-mix(in_oklch,var(--nestora-sage)_25%,transparent)]' : 'border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))]',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(report.id)}
              className={cn('flex w-full flex-col p-4 text-left sm:p-5', focusRing)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-xl border" style={{ color: meta.accent }}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {report.frRef}
                </Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--nestora-forest)]">{report.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{report.description}</p>
              <div className="mt-3 flex items-end justify-between gap-2">
                <Sparkline values={report.sparkline} />
                <span className="text-[10px] text-muted-foreground">{report.refresh}</span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Last run {formatReportWhen(report.lastRun)}</p>
            </button>
            <motion.div className="border-t px-4 py-2">
              <Link
                href={`/admin/reports/${report.id}`}
                className={cn('inline-flex items-center gap-1 text-xs font-semibold text-[var(--nestora-forest)]', focusRing)}
              >
                Open full report
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </motion.div>
          </motion.article>
        );
      })}
    </div>
  );
}
