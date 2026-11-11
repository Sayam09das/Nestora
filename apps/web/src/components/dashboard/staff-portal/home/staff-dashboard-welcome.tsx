'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { StaffDashboardSnapshot } from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

type Props = {
  snapshot: StaffDashboardSnapshot;
  displayName: string;
  roleFocus: string;
};

export function StaffDashboardWelcome({ snapshot, displayName, roleFocus }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState(() => new Date());
  const greeting = useMemo(() => getGreeting(), [now]);
  const dateLabel = useMemo(() => formatLongDate(now), [now]);
  const firstName = displayName.split(' ')[0] ?? displayName;

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-staff-welcome-item]'), {
        opacity: 0,
        y: 12,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
        'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_55%,var(--card))_0%,var(--card)_45%,color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))_100%)]',
        'p-6 shadow-sm sm:p-7',
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[color-mix(in_oklch,var(--nestora-gold)_18%,transparent)] blur-3xl"
        aria-hidden
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: motionEase }}
        className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div data-staff-welcome-item className="min-w-0 space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-2xl">
            {greeting}, {firstName}!
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Here&apos;s your work overview for today. Stay organized and keep things running smoothly.
          </p>
          <p className="text-xs text-[color-mix(in_oklch,var(--nestora-sage)_65%,var(--muted-foreground))]">{roleFocus}</p>
        </div>
        <div data-staff-welcome-item className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_10%,var(--card))] font-semibold text-[var(--nestora-forest)]"
            >
              {snapshot.workplace.name}
            </Badge>
            <Badge className="bg-[var(--nestora-forest)] text-white hover:bg-[var(--nestora-forest)]">
              {snapshot.workplace.status}
            </Badge>
          </div>
          <time className="text-sm font-medium text-muted-foreground" dateTime={now.toISOString()}>
            {dateLabel}
          </time>
        </div>
      </motion.div>
    </section>
  );
}
