'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Timer } from 'lucide-react';
import { useRef } from 'react';

import type { StaffDashboardSnapshot } from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = { snapshot: StaffDashboardSnapshot };

export function StaffDashboardShiftPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { shift } = snapshot;

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelector('[data-staff-shift-bar]'), {
        scaleX: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  const elapsedPercent = 54;

  return (
    <motion.section
      ref={sectionRef}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="staff-shift-heading"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="staff-shift-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            My current shift
          </h2>
          <p className="text-sm text-muted-foreground">Today&apos;s Shift</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,emerald_55%_28%,var(--border))] bg-[color-mix(in_oklch,emerald_50%_10%,var(--card))] px-2.5 py-1 text-xs font-semibold text-[var(--nestora-forest)]">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          {shift.stateLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Shift starts</p>
          <p className="mt-1 text-lg font-semibold text-[var(--nestora-forest)]">{shift.start}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Shift ends</p>
          <p className="mt-1 text-lg font-semibold text-[var(--nestora-forest)]">{shift.end}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Timer className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            Time elapsed
          </span>
          <span className="font-semibold tabular-nums text-[var(--nestora-forest)]">{shift.elapsed}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            data-staff-shift-bar
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--nestora-sage),var(--nestora-forest))]"
            style={{ width: `${elapsedPercent}%` }}
            role="progressbar"
            aria-valuenow={elapsedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Shift time elapsed"
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>Check-in: {shift.checkIn}</span>
          <span>{shift.end}</span>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--nestora-gold)]" aria-hidden />
        <span>
          <span className="font-medium text-foreground">Assigned location:</span> {shift.location}
        </span>
      </p>
    </motion.section>
  );
}
