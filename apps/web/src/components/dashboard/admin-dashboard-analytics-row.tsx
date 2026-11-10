'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BedDouble,
  BellRing,
  CircleDollarSign,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { AdminDashboardOverview } from '@/lib/api/dashboard';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const chartConfig = {
  fees: {
    label: 'Fees collected',
    color: 'var(--nestora-forest)',
  },
} satisfies ChartConfig;

function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const BAR_COLORS = ['#8ba391', '#6d9773', '#4d7a5c', '#2d5c45', '#164c3c', '#ffba00'] as const;

function activityIcon(actionName: string, entityType: string) {
  if (actionName.includes('BED') || actionName.includes('ROOM') || entityType === 'AllocationRecord') {
    return { icon: BedDouble, accent: 'var(--nestora-forest)' };
  }
  if (actionName.includes('FEE') || entityType === 'FeeSchedule') {
    return { icon: CircleDollarSign, accent: 'var(--nestora-gold)' };
  }
  if (actionName === 'USER_PROVISIONED' || actionName === 'ACCOUNT_ACTIVATED') {
    return { icon: UserPlus, accent: 'var(--nestora-sage)' };
  }
  return { icon: Activity, accent: 'var(--nestora-sage)' };
}

type AdminDashboardAnalyticsRowProps = {
  overview: AdminDashboardOverview | null;
  loading?: boolean;
};

export function AdminDashboardAnalyticsRow({ overview, loading = false }: AdminDashboardAnalyticsRowProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);

  const feeChartData = overview?.fees.monthlyTrend ?? [];

  const growthPct = useMemo(() => {
    if (feeChartData.length < 2) {
      return null;
    }
    const first = feeChartData[0]?.feesInr ?? 1;
    const last = feeChartData[feeChartData.length - 1]?.feesInr ?? first;
    return Math.round(((last - first) / first) * 1000) / 10;
  }, [feeChartData]);

  const activities = useMemo(() => {
    const rows = overview?.recentActivities ?? [];
    return rows.map((row) => {
      const visual = activityIcon(row.actionName, row.entityType);
      return {
        id: row.id,
        title: row.title,
        detail: row.detail,
        time: formatRelativeTime(row.occurredAt),
        ...visual,
      };
    });
  }, [overview?.recentActivities]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-analytics-panel]'), {
        opacity: 0,
        y: 18,
        duration: 0.45,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  useGSAP(
    () => {
      if (reduceMotion || !chartWrapRef.current) {
        return;
      }
      const bars = chartWrapRef.current.querySelectorAll('.recharts-bar-rectangle');
      if (!bars.length) {
        return;
      }
      gsap.from(bars, {
        scaleY: 0,
        transformOrigin: '50% 100%',
        duration: 0.55,
        stagger: 0.07,
        ease: 'back.out(1.35)',
        delay: 0.15,
        clearProps: 'transform',
      });
    },
    { scope: chartWrapRef, dependencies: [reduceMotion, feeChartData.length], revertOnUpdate: true },
  );

  return (
    <section ref={sectionRef} className="grid gap-4 lg:grid-cols-5" aria-labelledby="admin-analytics-heading">
      <h2 id="admin-analytics-heading" className="sr-only">
        Charts and recent activities
      </h2>

      <article
        data-admin-dash-card
        data-analytics-panel
        className={cn(
          'flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm',
          'lg:col-span-3',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nestora-sage-muted)]/70 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)]">
              <BarChart3 className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Analytics</p>
              <p className="text-base font-semibold text-[var(--nestora-forest)]">Monthly fee collection</p>
            </div>
          </div>
          {growthPct != null ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))] px-2.5 py-1 text-xs font-bold text-[var(--nestora-forest)]">
              <TrendingUp className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              +{growthPct}% trend
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">MS-4</span>
          )}
        </div>

        <div
          ref={chartWrapRef}
          className="flex flex-1 flex-col bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] px-2 pb-2 pt-4 sm:px-4"
        >
          {feeChartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="aspect-[16/10] min-h-[200px] w-full sm:min-h-[240px]">
              <BarChart data={feeChartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="color-mix(in oklch, var(--nestora-sage-muted) 65%, transparent)"
                  strokeDasharray="4 6"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `₹${Math.round(Number(v) / 1000)}K`}
                  width={44}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={{ fill: 'color-mix(in oklch, var(--nestora-sage) 12%, transparent)', radius: 8 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatInr(Number(value))}
                      labelFormatter={(label) => String(label)}
                    />
                  }
                />
                <Bar dataKey="feesInr" radius={[8, 8, 2, 2]} maxBarSize={52}>
                  {feeChartData.map((entry, index) => (
                    <Cell key={entry.month} fill={BAR_COLORS[index] ?? BAR_COLORS[BAR_COLORS.length - 1]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <motion.p
              className="flex min-h-[200px] flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground sm:min-h-[240px]"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {loading && !overview
                ? 'Loading analytics…'
                : 'Fee collection chart activates when MS-4 ledger data is available.'}
            </motion.p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--nestora-sage-muted)]/70 px-4 py-3 sm:px-5">
          <p className="text-[11px] text-muted-foreground">
            {overview?.generatedAt
              ? `Snapshot ${formatRelativeTime(overview.generatedAt)}`
              : 'Live overview snapshot'}
          </p>
          <Link
            href="/admin/reports"
            className={cn(
              'inline-flex items-center gap-1 text-sm font-semibold text-[var(--nestora-forest)]',
              'rounded-lg px-2 py-1 transition-colors hover:bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,transparent)]',
              focusRing,
            )}
          >
            Reports
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </article>

      <article
        data-admin-dash-card
        data-analytics-panel
        className={cn(
          'flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm',
          'lg:col-span-2',
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-sage)_92%,#5a8260)_0%,var(--nestora-sage)_100%)] px-4 py-3.5 sm:px-5">
          <span className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white">
            <Activity className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Live feed</p>
            <p className="text-base font-semibold text-white">Recent activities</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <p className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground">
            {loading && !overview ? 'Loading activity…' : 'No audit events yet — actions across Nestora appear here.'}
          </p>
        ) : (
          <ol className="relative flex-1 space-y-0 px-3 py-4 sm:px-4">
            <span
              className="pointer-events-none absolute bottom-6 left-[1.85rem] top-6 w-px bg-[linear-gradient(180deg,var(--nestora-sage-muted),color-mix(in_oklch,var(--nestora-gold)_55%,var(--nestora-sage-muted)))] sm:left-[2.1rem]"
              aria-hidden
            />
            {activities.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="relative">
                  <motion.div
                    className="flex gap-3 rounded-xl px-1 py-2.5 sm:gap-3.5"
                    initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 + index * 0.08, ease: motionEase }}
                    whileHover={reduceMotion ? undefined : { x: 2 }}
                  >
                    <span className="relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-card bg-card shadow-sm sm:size-10">
                      <span
                        className="flex size-full items-center justify-center rounded-full"
                        style={{ background: `color-mix(in oklch, ${item.accent} 18%, var(--card))` }}
                      >
                        <Icon className="size-3.5" style={{ color: item.accent }} aria-hidden />
                      </span>
                    </span>
                    <div className="min-w-0 flex-1 pb-1 pt-0.5">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.detail}</p>
                      <time className="mt-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--nestora-tan)]">
                        {item.time}
                      </time>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        )}

        <motion.div
          className="mt-auto border-t border-[var(--nestora-sage-muted)]/70 p-3 sm:p-4"
          whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        >
          <Link
            href="/admin/audit-logs"
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_20%,var(--card))] px-4 py-2.5 text-sm font-semibold text-[var(--nestora-forest)]',
              'transition-colors hover:bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))]',
              focusRing,
            )}
          >
            <BellRing className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            Open activity logs
          </Link>
        </motion.div>
      </article>
    </section>
  );
}
