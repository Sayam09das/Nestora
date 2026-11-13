'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  CATEGORY_META,
  formatSettingsWhen,
  type SettingsPanel,
} from '@/components/dashboard/settings/admin-settings-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  panels: SettingsPanel[];
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
          className="w-1.5 rounded-sm bg-[color-mix(in_oklch,var(--nestora-sage)_65%,var(--border))]"
          style={{ height: `${Math.round((v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

const statusTone: Record<SettingsPanel['status'], string> = {
  Synced: 'bg-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--muted))] text-[var(--nestora-forest)]',
  Draft: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  'Pending approval': 'bg-sky-500/15 text-sky-900 dark:text-sky-100',
};

export function AdminSettingsHub({ panels, selectedId, onSelect, listKey, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !gridRef.current || hidden) return;
      gsap.from(gridRef.current.querySelectorAll('[data-set-card]'), {
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
      data-set-reveal
      data-set-flip
      className={cn('grid gap-4 lg:grid-cols-2 xl:grid-cols-3', hidden && 'hidden')}
      aria-hidden={hidden}
    >
      {panels.map((panel) => {
        const meta = CATEGORY_META[panel.category];
        const Icon = meta.icon;
        const active = panel.id === selectedId;
        return (
          <motion.article
            key={panel.id}
            data-set-flip
            data-set-card
            layout={!reduceMotion}
            className={cn(
              'overflow-hidden rounded-2xl border bg-[color-mix(in_oklch,var(--nestora-cream)_8%,var(--card))] shadow-sm backdrop-blur-[2px] transition-shadow',
              active
                ? 'border-[var(--nestora-forest)] ring-2 ring-[color-mix(in_oklch,var(--nestora-sage)_25%,transparent)]'
                : 'border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))]',
            )}
          >
            <button type="button" onClick={() => onSelect(panel.id)} className={cn('flex w-full flex-col p-4 text-left sm:p-5', focusRing)}>
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex size-10 items-center justify-center rounded-xl border bg-card/80"
                  style={{ color: meta.accent }}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {panel.frRef}
                  </Badge>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', statusTone[panel.status])}>{panel.status}</span>
                </div>
              </div>
              <div className="mt-3 text-base font-semibold text-[var(--nestora-forest)]">{panel.title}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{panel.description}</p>
              <div className="mt-3 flex items-end justify-between gap-2">
                <Sparkline values={panel.sparkline} />
                <span className="text-[10px] text-muted-foreground">{panel.controlsCount} controls</span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Updated {formatSettingsWhen(panel.lastModified)}</p>
            </button>
            <div className="border-t px-4 py-2">
              <Link
                href={`/admin/settings/${panel.id}`}
                className={cn('inline-flex items-center gap-1 text-xs font-semibold text-[var(--nestora-forest)]', focusRing)}
              >
                Open panel
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
