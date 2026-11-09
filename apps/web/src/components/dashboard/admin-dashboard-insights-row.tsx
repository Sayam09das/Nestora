'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  MessageSquareWarning,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const pendingApprovals = [
  {
    label: 'Student registrations',
    count: 5,
    href: '/admin/students/requests',
    icon: Users,
    tint: 'color-mix(in oklch, var(--nestora-sage) 16%, var(--card))',
    iconColor: 'var(--nestora-sage)',
  },
  {
    label: 'Leave requests',
    count: 4,
    href: '/admin/leave',
    icon: ClipboardList,
    tint: 'color-mix(in oklch, var(--nestora-tan) 14%, var(--card))',
    iconColor: 'var(--nestora-tan)',
  },
  {
    label: 'Complaints',
    count: 3,
    href: '/admin/complaints',
    icon: MessageSquareWarning,
    tint: 'color-mix(in oklch, var(--nestora-gold) 16%, var(--card))',
    iconColor: 'var(--nestora-gold)',
  },
] as const;

const FEES_COLLECTED = 485_000;
const FEES_PENDING = 75_000;
const FEES_EXPECTED = 560_000;

function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInrCompact(value: number): string {
  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(2)}L`;
  }
  return formatInr(value);
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const totalPending = pendingApprovals.reduce((sum, item) => sum + item.count, 0);
const collectionRate = Math.round((FEES_COLLECTED / FEES_EXPECTED) * 1000) / 10;

export function AdminDashboardInsightsRow() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef({ value: 0 });
  const [displayCollected, setDisplayCollected] = useState(reduceMotion ? FEES_COLLECTED : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayCollected(FEES_COLLECTED);
      return;
    }
    const tween = gsap.to(amountRef.current, {
      value: FEES_COLLECTED,
      duration: 1.05,
      ease: 'power2.out',
      delay: 0.15,
      onUpdate: () => setDisplayCollected(Math.round(amountRef.current.value)),
    });
    return () => {
      tween.kill();
    };
  }, [reduceMotion]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-insights-item]'), {
        opacity: 0,
        y: 16,
        scale: 0.98,
        duration: 0.4,
        stagger: { each: 0.08, from: 'start', grid: 'auto' },
        ease: 'back.out(1.2)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  useGSAP(
    () => {
      const bar = progressRef.current;
      if (!bar || reduceMotion) {
        if (bar) {
          bar.style.width = `${collectionRate}%`;
        }
        return;
      }
      gsap.fromTo(
        bar,
        { width: '0%' },
        { width: `${collectionRate}%`, duration: 0.9, ease: 'power2.out', delay: 0.25 },
      );
    },
    { dependencies: [reduceMotion, collectionRate] },
  );

  return (
    <section ref={sectionRef} className="grid gap-4 lg:grid-cols-2" aria-labelledby="admin-insights-heading">
      <h2 id="admin-insights-heading" className="sr-only">
        Pending approvals and financial overview
      </h2>

      {/* Approvals inbox */}
      <article
        data-admin-dash-card
        data-insights-item
        className={cn(
          'overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm',
        )}
      >
        <Link
          href="/admin/students/requests"
          className={cn(
            'flex items-center justify-between gap-3 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-gold)_28%,var(--card))_0%,color-mix(in_oklch,var(--nestora-cream)_35%,var(--card))_100%)] px-4 py-3.5 sm:px-5',
            focusRing,
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-card text-[var(--nestora-forest)] shadow-sm">
              <ShieldCheck className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-tan)]">Inbox</p>
              <p className="text-base font-semibold text-[var(--nestora-forest)]">Pending approvals</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_22%,white)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--nestora-forest)]">
            {totalPending} pending
            <ChevronRight className="size-3.5 opacity-60" aria-hidden />
          </span>
        </Link>

        <p className="border-b border-[var(--nestora-sage-muted)]/60 px-4 py-2 text-[11px] text-muted-foreground sm:px-5">
          Requests awaiting action — tap a row to review
        </p>

        <ul className="divide-y divide-[var(--nestora-sage-muted)]/50 p-2 sm:p-3">
          {pendingApprovals.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.08 + index * 0.06, ease: motionEase }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors sm:px-2.5',
                      'hover:bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,transparent)]',
                      focusRing,
                    )}
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] shadow-sm"
                      style={{ background: item.tint }}
                    >
                      <Icon className="size-4" style={{ color: item.iconColor }} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground">Needs your review</span>
                    </span>
                    <motion.span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-xs font-bold text-white shadow-sm"
                      whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                    >
                      {item.count}
                    </motion.span>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </article>

      {/* Finance snapshot */}
      <article
        data-admin-dash-card
        data-insights-item
        className="flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: motionEase }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[linear-gradient(135deg,var(--nestora-forest)_0%,color-mix(in_oklch,var(--nestora-forest)_75%,#0a3428)_100%)] px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                <CircleDollarSign className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Finance</p>
                <p className="text-base font-semibold text-white">Fee collection</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90">
              <TrendingUp className="size-3 text-[var(--nestora-gold)]" aria-hidden />
              {collectionRate}%
            </span>
          </div>

          <div className="relative overflow-hidden px-4 py-5 transition-colors hover:bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Collected this month
            </p>
            <p className="mt-1 text-[1.75rem] font-semibold leading-tight tabular-nums tracking-tight text-[var(--nestora-forest)] sm:text-3xl">
              {formatInr(displayCollected)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{formatInrCompact(FEES_COLLECTED)}</span> of{' '}
              {formatInrCompact(FEES_EXPECTED)} expected
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                <span>Collection progress</span>
                <span className="tabular-nums text-[var(--nestora-forest)]">{collectionRate}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--nestora-sage-muted)]">
                <div
                  ref={progressRef}
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--nestora-sage),var(--nestora-forest))]"
                  style={{ width: reduceMotion ? `${collectionRate}%` : '0%' }}
                  role="progressbar"
                  aria-valuenow={collectionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Fee collection progress"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-3 sm:gap-3 sm:p-4">
            <BadgeMetric label="Pending fees" value={FEES_PENDING} tone="warning" />
            <BadgeMetric label="Total expected" value={FEES_EXPECTED} tone="neutral" />
          </div>

          <motion.div
            className="border-t border-[var(--nestora-sage-muted)]/70 p-3 sm:p-4"
            whileTap={reduceMotion ? undefined : { scale: 0.995 }}
          >
            <Link
              href="/admin/fees"
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nestora-forest)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm',
                'transition-[filter] hover:brightness-110',
                focusRing,
              )}
            >
              Open fees &amp; payments
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </article>
    </section>
  );
}

function BadgeMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'warning' | 'neutral';
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 480, damping: 28 }}
      className={cn(
        'rounded-xl border px-3 py-2.5',
        tone === 'warning'
          ? 'border-[color-mix(in_oklch,var(--nestora-tan)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-tan)_10%,var(--card))]'
          : 'border-[var(--nestora-sage-muted)] bg-card',
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--nestora-forest)] sm:text-base">
        {formatInr(value)}
      </p>
    </motion.div>
  );
}
