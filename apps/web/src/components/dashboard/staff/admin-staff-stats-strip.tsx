'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Clock3, Shield, TrendingUp, UserCheck, UserCog, UserX, Users } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { StaffDirectorySummary } from '@/lib/api/staff';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const BAR_GREEN = '#6d9773';
const BAR_GOLD = '#ffba00';

type AdminStaffStatsStripProps = {
  summary: StaffDirectorySummary | null;
  loading?: boolean;
};

export function AdminStaffStatsStrip({ summary, loading = false }: AdminStaffStatsStripProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const stats = useMemo(() => {
    const total = summary?.total ?? 0;
    const active = summary?.active ?? 0;
    const onLeave = summary?.onLeave ?? 0;
    const inactive = summary?.inactive ?? 0;
    const activePct = total > 0 ? Math.round((active / total) * 1000) / 10 : 0;
    const onLeavePct = total > 0 ? Math.round((onLeave / total) * 1000) / 10 : 0;
    const inactivePct = total > 0 ? Math.round((inactive / total) * 1000) / 10 : 0;
    const monthDelta =
      summary == null
        ? '—'
        : summary.createdThisMonth === 0
          ? 'No new this month'
          : summary.createdThisMonth === 1
            ? '+1 this mo.'
            : `+${summary.createdThisMonth} this mo.`;

    return [
      {
        key: 'total',
        label: 'Total Staff',
        value: total,
        hint: 'Full personnel directory',
        delta: monthDelta,
        icon: UserCog,
        accent: 'var(--nestora-forest)',
        surface: 'color-mix(in oklch, var(--nestora-forest) 7%, var(--card))',
        barPct: 100,
        barColor: 'var(--nestora-sage)',
      },
      {
        key: 'active',
        label: 'Active',
        value: active,
        hint: 'On duty & available',
        delta: `${activePct}%`,
        icon: UserCheck,
        accent: BAR_GREEN,
        surface: 'color-mix(in oklch, var(--nestora-sage) 14%, var(--card))',
        barPct: activePct,
        barColor: BAR_GREEN,
      },
      {
        key: 'onLeave',
        label: 'On Leave',
        value: onLeave,
        hint: 'Approved time away',
        delta: `${onLeavePct}%`,
        icon: Clock3,
        accent: BAR_GOLD,
        surface: 'color-mix(in oklch, var(--nestora-gold) 16%, var(--card))',
        barPct: onLeavePct,
        barColor: BAR_GOLD,
      },
      {
        key: 'inactive',
        label: 'Inactive',
        value: inactive,
        hint: 'Separated or dormant',
        delta: `${inactivePct}%`,
        icon: UserX,
        accent: 'var(--muted-foreground)',
        surface: 'color-mix(in oklch, var(--nestora-cream) 22%, var(--card))',
        barPct: inactivePct,
        barColor: 'color-mix(in oklch, var(--muted-foreground) 55%, var(--border))',
      },
    ] as const;
  }, [summary]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-staff-stat-card]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: { each: 0.07, from: 'start', grid: 'auto' },
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
      gsap.from(sectionRef.current.querySelectorAll('[data-staff-stat-bar]'), {
        scaleX: 0,
        duration: 0.65,
        stagger: 0.07,
        delay: 0.12,
        ease: 'power3.out',
        transformOrigin: 'left center',
        clearProps: 'transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="staff-summary-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Directory</p>
          <h2 id="staff-summary-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Live snapshot
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Shares of {loading && summary == null ? '—' : (summary?.total ?? 0).toLocaleString('en-IN')} records
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const showTrend = stat.key === 'active';
          return (
            <li key={stat.key} data-staff-stat-card>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: motionEase }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-4 shadow-sm',
                  'transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_oklch,var(--nestora-sage)_36%,var(--border))] hover:shadow-md',
                )}
                style={{ background: stat.surface }}
              >
                <span
                  className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
                  style={{ background: stat.accent }}
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(900px circle at 100% 0%, color-mix(in oklch, var(--nestora-sage) 12%, transparent), transparent 42%)',
                  }}
                  aria-hidden
                />

                <div className="relative mb-3 flex items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-card/90 text-[var(--nestora-forest)] shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
                    <Icon className="size-4" style={{ color: stat.accent }} aria-hidden />
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-card/85 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {showTrend || stat.key === 'total' ? (
                      <TrendingUp className="size-3 text-[#6d9773]" aria-hidden />
                    ) : null}
                    {stat.delta}
                  </span>
                </div>

                <p className="relative text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {stat.value.toLocaleString('en-IN')}
                </p>
                <p className="relative mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="relative mt-1 text-xs text-muted-foreground">{stat.hint}</p>

                <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-[#e7e7dc]">
                  <div
                    data-staff-stat-bar
                    className="h-full origin-left rounded-full"
                    style={{
                      width: `${stat.barPct}%`,
                      backgroundColor: stat.barColor,
                    }}
                    role="presentation"
                  />
                </div>
              </motion.article>
            </li>
          );
        })}
      </ul>

      {summary?.workforce ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Total wardens', value: summary.workforce.wardens, icon: UserCog },
            {
              label: 'Operational staff',
              value:
                summary.workforce.security +
                summary.workforce.administrative +
                summary.workforce.housekeeping +
                summary.workforce.maintenance +
                summary.workforce.otherStaff,
              icon: Users,
            },
            { label: 'Security personnel', value: summary.workforce.security, icon: Shield },
            { label: 'Administrative', value: summary.workforce.administrative, icon: Building2 },
            { label: 'Housekeeping', value: summary.workforce.housekeeping, icon: Users },
            { label: 'Maintenance', value: summary.workforce.maintenance, icon: Building2 },
          ].map((item) => (
            <li key={item.label}>
              <div className="flex h-full flex-col rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--border))] bg-card px-3 py-3 shadow-sm">
                <item.icon className="size-4 text-[var(--nestora-sage)]" aria-hidden />
                <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--nestora-forest)]">{item.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
