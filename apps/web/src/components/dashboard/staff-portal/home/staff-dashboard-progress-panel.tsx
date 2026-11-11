'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

import type { StaffDashboardSnapshot } from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = { snapshot: StaffDashboardSnapshot };

export function StaffDashboardProgressPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const { progress } = snapshot;

  useGSAP(
    () => {
      if (reduceMotion || !ringRef.current) return;
      const length = 2 * Math.PI * 54;
      gsap.fromTo(
        ringRef.current,
        { strokeDashoffset: length },
        {
          strokeDashoffset: length * (1 - progress.percent / 100),
          duration: 0.9,
          ease: 'power2.out',
        },
      );
    },
    { dependencies: [reduceMotion, progress.percent] },
  );

  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - progress.percent / 100);

  return (
    <motion.section
      ref={sectionRef}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: motionEase }}
      className={cn(
        'flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))]',
        'bg-[color-mix(in_oklch,var(--nestora-gold)_6%,var(--card))] p-5 shadow-sm',
      )}
      aria-labelledby="staff-progress-heading"
    >
      <h2 id="staff-progress-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
        Task completion progress
      </h2>
      <p className="text-sm text-muted-foreground">Daily Progress</p>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <div className="relative size-36 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle cx="60" cy="60" r="54" fill="none" stroke="color-mix(in oklch, var(--border) 80%, transparent)" strokeWidth="10" />
            <circle
              ref={ringRef}
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--nestora-forest)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={reduceMotion ? offset : circumference}
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.35, ease: motionEase }}
          >
            <span className="text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">{progress.percent}%</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="min-w-0 space-y-2 text-center sm:text-left"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{progress.completed} completed</span>
            {' · '}
            <span>{progress.assigned} assigned</span>
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{progress.message}</p>
        </motion.div>
      </div>
    </motion.section>
  );
}
