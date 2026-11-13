'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { WardenDashboardSnapshot } from '@/components/dashboard/warden/home/warden-dashboard-data';
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
  snapshot: WardenDashboardSnapshot;
  displayName: string;
  metricsUpdatedAt?: string | null;
};

export function WardenDashboardWelcome({ snapshot, displayName, metricsUpdatedAt }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState(() => new Date());
  const greeting = useMemo(() => getGreeting(), [now]);
  const dateLabel = useMemo(() => formatLongDate(now), [now]);
  const firstName = displayName.split(' ')[0] ?? displayName;

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = setInterval(tick, 15_000);
    return () => clearInterval(interval);
  }, []);

  const syncedLabel = metricsUpdatedAt
    ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(metricsUpdatedAt))
    : null;

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-warden-welcome-item]'), {
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
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div data-warden-welcome-item className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {greeting}, <span className="font-semibold text-foreground">{firstName}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[1.65rem]">
            Here&apos;s what&apos;s happening at your assigned hostel today.
          </h1>
          <nav className="mt-3 flex flex-wrap items-center gap-2" aria-label="Hostel context">
            <span className="text-sm font-semibold text-foreground">{snapshot.hostelName}</span>
            <Badge
              variant="outline"
              className="border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--card))] text-[var(--nestora-forest)]"
            >
              Active
            </Badge>
          </nav>
        </div>
        <div data-warden-welcome-item className="shrink-0 text-right text-sm font-medium tabular-nums text-muted-foreground">
          <p>{dateLabel}</p>
          {syncedLabel ? (
            <p className="mt-1 text-[11px] font-normal text-[var(--nestora-sage)]">
              Metrics synced {syncedLabel}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
