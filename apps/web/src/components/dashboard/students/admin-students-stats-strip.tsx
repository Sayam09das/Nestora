'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, TrendingUp, UserCheck, Users, UserX } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { STUDENT_DIRECTORY_STATS } from '@/components/dashboard/students/admin-students-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const BAR_GREEN = '#6d9773';
const BAR_GOLD = '#ffba00';

export function AdminStudentsStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const stats = useMemo(() => {
    const total = STUDENT_DIRECTORY_STATS.total;
    const activePct = Math.round((STUDENT_DIRECTORY_STATS.active / total) * 1000) / 10;
    const pendingPct = Math.round((STUDENT_DIRECTORY_STATS.pending / total) * 1000) / 10;
    const inactivePct = Math.round((STUDENT_DIRECTORY_STATS.inactive / total) * 1000) / 10;

    return [
      {
        key: 'total',
        label: 'Total Students',
        value: total,
        hint: 'Entire hostel directory',
        delta: '+12 this mo.',
        icon: Users,
        accent: 'var(--nestora-forest)',
        surface: 'color-mix(in oklch, var(--nestora-forest) 7%, var(--card))',
        barPct: 100,
        barColor: 'var(--nestora-sage)',
      },
      {
        key: 'active',
        label: 'Active',
        value: STUDENT_DIRECTORY_STATS.active,
        hint: 'Checked in & enrolled',
        delta: `${activePct}%`,
        icon: UserCheck,
        accent: BAR_GREEN,
        surface: 'color-mix(in oklch, var(--nestora-sage) 14%, var(--card))',
        barPct: activePct,
        barColor: BAR_GREEN,
      },
      {
        key: 'pending',
        label: 'Pending',
        value: STUDENT_DIRECTORY_STATS.pending,
        hint: 'Awaiting approval',
        delta: `${pendingPct}%`,
        icon: Clock3,
        accent: BAR_GOLD,
        surface: 'color-mix(in oklch, var(--nestora-gold) 16%, var(--card))',
        barPct: pendingPct,
        barColor: BAR_GOLD,
      },
      {
        key: 'inactive',
        label: 'Inactive',
        value: STUDENT_DIRECTORY_STATS.inactive,
        hint: 'Archived or exited',
        delta: `${inactivePct}%`,
        icon: UserX,
        accent: 'var(--muted-foreground)',
        surface: 'color-mix(in oklch, var(--nestora-cream) 22%, var(--card))',
        barPct: inactivePct,
        barColor: 'color-mix(in oklch, var(--muted-foreground) 55%, var(--border))',
      },
    ] as const;
  }, []);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-students-stat-card]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: { each: 0.07, from: 'start', grid: 'auto' },
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
      gsap.from(sectionRef.current.querySelectorAll('[data-students-stat-bar]'), {
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
    <section ref={sectionRef} aria-labelledby="students-summary-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Directory</p>
          <h2 id="students-summary-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Live snapshot
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">Shares of {STUDENT_DIRECTORY_STATS.total.toLocaleString('en-IN')} records</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const showTrend = stat.key === 'active';
          return (
            <li key={stat.key} data-students-stat-card>
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
                    data-students-stat-bar
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
    </section>
  );
}
