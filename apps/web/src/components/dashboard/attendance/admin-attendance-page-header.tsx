'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Download, Send } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { NightAttendanceSummary } from '@/lib/api/attendance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  sessionDate: string;
  onSessionDateChange: (v: string) => void;
  onPublish: () => void;
  summary: NightAttendanceSummary | null;
  loading?: boolean;
};

export function AdminAttendancePageHeader({
  sessionDate,
  onSessionDateChange,
  onPublish,
  summary,
  loading = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const liveLabel = useMemo(() => {
    if (!summary?.generatedAt || loading) return null;
    return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(
      new Date(summary.generatedAt),
    );
  }, [summary?.generatedAt, loading]);

  const rateLabel =
    summary?.todayRatePct != null ? `${summary.todayRatePct}%` : summary && !loading ? '—' : '…';

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-att-hero]'), {
        opacity: 0,
        y: 12,
        stagger: 0.06,
        duration: 0.42,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p data-att-hero className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            Dashboard / Attendance
            {liveLabel ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--nestora-forest)]">
                Live · {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 data-att-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Night attendance
          </h1>
          <p data-att-hero className="max-w-2xl text-sm text-muted-foreground">
            Record Present, Absent, or On Leave for tonight’s roll call. Approved leave auto-fills as On Leave; unexplained
            absences notify the warden (FR-050).
          </p>
        </div>
        <motion.div data-att-hero className="flex flex-wrap items-end gap-3" layout="position">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Session date</span>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => onSessionDateChange(e.target.value)}
              className={cn('h-10 w-[11rem] rounded-xl', focusRing)}
            />
          </label>
          <Button type="button" variant="outline" className={cn('h-10 rounded-xl', focusRing)}>
            <Download className="size-4" aria-hidden />
            Export
          </Button>
          <Button type="button" onClick={onPublish} className={cn('h-10 rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
            <Send className="size-4" aria-hidden />
            Publish roster
          </Button>
        </motion.div>
      </div>
      <p data-att-hero className="mt-4 text-xs text-muted-foreground">
        {loading && !summary ? (
          'Loading session totals…'
        ) : summary ? (
          <>
            {summary.presentToday} present · {summary.absentToday} absent · {summary.onLeaveToday} on leave · {rateLabel}{' '}
            rate · {summary.residentsTotal} residents
          </>
        ) : (
          'Session totals unavailable.'
        )}
      </p>
    </header>
  );
}
