'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, CalendarDays, Send } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { NightAttendanceSummary } from '@/lib/api/attendance';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  hostelName: string;
  sessionDate: string;
  onSessionDateChange: (v: string) => void;
  onPublish: () => void;
  summary: NightAttendanceSummary | null;
  loading?: boolean;
};

export function WardenAttendanceHeader({
  hostelName,
  sessionDate,
  onSessionDateChange,
  onPublish,
  summary,
  loading = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const liveLabel = useMemo(() => {
    if (!summary?.generatedAt) return null;
    return formatRelativeTimeFromIso(summary.generatedAt);
  }, [summary?.generatedAt]);

  const rateLabel =
    summary?.todayRatePct != null ? `${summary.todayRatePct}%` : summary && !loading ? '—' : '…';

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-warden-att-hero]'), {
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
      className={cn(
        'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
        'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_48%,var(--card))_0%,var(--card)_62%)] p-5 shadow-sm sm:p-6',
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p data-warden-att-hero className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <CalendarDays className="size-3.5" aria-hidden />
            Night roll call · MOD-09
            {liveLabel ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                Synced {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 data-warden-att-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Attendance roster
          </h1>
          <p data-warden-att-hero className="max-w-2xl text-sm text-muted-foreground">
            Mark tonight&apos;s residents Present, Absent, or On Leave. Approved leave syncs automatically; changes save
            to attendance records in real time (FR-050).
          </p>
          <motion.div
            data-warden-att-hero
            className="flex flex-wrap items-center gap-2 pt-1"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.06, duration: 0.35, ease: motionEase }}
          >
            <Badge
              variant="outline"
              className="gap-1.5 border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-card font-semibold text-[var(--nestora-forest)]"
            >
              <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {hostelName}
            </Badge>
          </motion.div>
        </div>
        <motion.div data-warden-att-hero className="flex flex-wrap items-end gap-3" layout="position">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Session date</span>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => onSessionDateChange(e.target.value)}
              className={cn('h-10 w-[11rem] rounded-xl', focusRing)}
            />
          </label>
          <Button
            type="button"
            onClick={onPublish}
            className={cn('h-10 rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
          >
            <Send className="size-4" aria-hidden />
            Publish roster
          </Button>
        </motion.div>
      </div>
      <p data-warden-att-hero className="mt-4 text-xs text-muted-foreground">
        {loading && !summary ? (
          'Loading session totals…'
        ) : summary ? (
          <>
            {summary.presentToday} present · {summary.absentToday} absent · {summary.onLeaveToday} on leave · {rateLabel}{' '}
            rate · {summary.residentsTotal} residents
            {summary.unmarked > 0 ? ` · ${summary.unmarked} unmarked` : null}
          </>
        ) : (
          'Session totals unavailable.'
        )}
      </p>
    </header>
  );
}
