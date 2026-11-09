'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BedDouble,
  Building2,
  Megaphone,
  Sparkles,
  UserCog,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const OCCUPIED = 145;
const TOTAL_ROOMS = 180;

const quickActions = [
  {
    title: 'Add Student',
    description: 'Register a student',
    href: '/admin/students/new',
    icon: UserPlus,
    accent: 'var(--nestora-sage)',
    surface: 'color-mix(in oklch, var(--nestora-sage) 14%, var(--card))',
  },
  {
    title: 'Create Staff',
    description: 'Add staff or warden',
    href: '/admin/staff/new',
    icon: UserCog,
    accent: 'var(--nestora-forest)',
    surface: 'color-mix(in oklch, var(--nestora-forest) 8%, var(--card))',
  },
  {
    title: 'Allocate Room',
    description: 'Assign a student',
    href: '/admin/allocation',
    icon: BedDouble,
    accent: 'var(--nestora-tan)',
    surface: 'color-mix(in oklch, var(--nestora-tan) 12%, var(--card))',
  },
  {
    title: 'Announcement',
    description: 'Publish an update',
    href: '/admin/announcements',
    icon: Megaphone,
    accent: 'var(--nestora-gold)',
    surface: 'color-mix(in oklch, var(--nestora-gold) 18%, var(--card))',
  },
] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

/** Share of the filled arc rendered in green; rest of fill is yellow (only these two on the ring). */
const GREEN_FILL_RATIO = 0.62;

/** Nestora green + yellow only — flat strokes, no gradients or tan/sage extras on the ring. */
const RING_GREEN = '#6d9773';
const RING_YELLOW = '#ffba00';
const RING_TRACK = '#e7e7dc';
const RING_CENTER = '#ffffff';

type OccupancyGaugeProps = {
  percent: number;
  reduceMotion: boolean | null;
};

function OccupancyGauge({ percent, reduceMotion }: OccupancyGaugeProps) {
  const greenRef = useRef<SVGCircleElement>(null);
  const goldRef = useRef<SVGCircleElement>(null);

  const filledLen = (RING_C * percent) / 100;
  const greenLen = filledLen * GREEN_FILL_RATIO;
  const goldLen = filledLen - greenLen;
  const hasYellow = goldLen > 0.5;
  const greenArcLen = hasYellow ? greenLen : filledLen;
  const greenGap = Math.max(RING_C - greenArcLen, 0);
  const goldGap = Math.max(RING_C - goldLen, 0);
  const yellowEndOffset = -greenArcLen;

  useGSAP(
    () => {
      const green = greenRef.current;
      const gold = goldRef.current;
      if (!green || !gold) {
        return;
      }

      if (reduceMotion) {
        green.style.strokeDashoffset = '0';
        if (hasYellow) {
          gold.style.strokeDashoffset = String(yellowEndOffset);
        }
        return;
      }

      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(
        green,
        { strokeDashoffset: RING_C },
        { strokeDashoffset: 0, duration: 0.85, ease: 'power3.out' },
      );
      if (hasYellow) {
        tl.fromTo(
          gold,
          { strokeDashoffset: RING_C - greenArcLen },
          { strokeDashoffset: yellowEndOffset, duration: 0.5, ease: 'power2.out' },
          '-=0.1',
        );
      }
    },
    { dependencies: [percent, reduceMotion, greenArcLen, goldLen, hasYellow, yellowEndOffset] },
  );

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div
        className="relative flex size-[7.75rem] items-center justify-center sm:size-[8.5rem]"
        role="img"
        aria-label={`Hostel occupancy ${percent} percent`}
      >
        <svg className="-rotate-90 size-full" viewBox="0 0 112 112" aria-hidden>
          <circle cx="56" cy="56" r={RING_R + 5} fill={RING_CENTER} />
          <circle cx="56" cy="56" r={RING_R} fill="none" stroke={RING_TRACK} strokeWidth="10" />
          {/* Green: first segment along the ring (butt cap — meets yellow flush) */}
          <circle
            ref={greenRef}
            cx="56"
            cy="56"
            r={RING_R}
            fill="none"
            stroke={RING_GREEN}
            strokeWidth="10"
            strokeLinecap={hasYellow ? 'butt' : 'round'}
            strokeDasharray={`${greenArcLen} ${greenGap}`}
            strokeDashoffset={RING_C}
          />
          {/* Yellow: continues immediately after green — same radius, no overlap */}
          {hasYellow ? (
            <circle
              ref={goldRef}
                cx="56"
              cy="56"
              r={RING_R}
              fill="none"
              stroke={RING_YELLOW}
              strokeWidth="10"
              strokeLinecap="butt"
              strokeDasharray={`${goldLen} ${goldGap}`}
              strokeDashoffset={RING_C - greenArcLen}
            />
          ) : (
            <circle ref={goldRef} cx="56" cy="56" r={RING_R} fill="none" stroke="none" strokeWidth="0" />
          )}
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight text-[var(--nestora-forest)] sm:text-3xl">
            {percent}%
          </span>
          <span className="mt-1.5 flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: RING_GREEN }} aria-hidden />
            <span className="size-2.5 rounded-full" style={{ backgroundColor: RING_YELLOW }} aria-hidden />
          </span>
        </span>
      </div>
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[10px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: RING_GREEN }} aria-hidden />
          Green
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: RING_YELLOW }} aria-hidden />
          Yellow
        </span>
      </p>
    </div>
  );
}

type AdminDashboardOperationsBentoProps = {
  occupancyPercent?: number;
};

export function AdminDashboardOperationsBento({ occupancyPercent = 80.6 }: AdminDashboardOperationsBentoProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const percentRef = useRef({ value: 0 });
  const [displayPercent, setDisplayPercent] = useState(reduceMotion ? occupancyPercent : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayPercent(occupancyPercent);
      return;
    }
    const tween = gsap.to(percentRef.current, {
      value: occupancyPercent,
      duration: 1.05,
      ease: 'power2.out',
      delay: 0.08,
      onUpdate: () => setDisplayPercent(Number(percentRef.current.value.toFixed(1))),
    });
    return () => {
      tween.kill();
    };
  }, [occupancyPercent, reduceMotion]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-bento-item]'), {
        opacity: 0,
        y: 20,
        scale: 0.97,
        duration: 0.42,
        stagger: { each: 0.07, from: 'start', grid: 'auto' },
        ease: 'back.out(1.2)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  const available = TOTAL_ROOMS - OCCUPIED;

  return (
    <section ref={sectionRef} aria-labelledby="admin-operations-heading" className="grid gap-4 lg:grid-cols-12">
      <h2 id="admin-operations-heading" className="sr-only">
        Hostel occupancy and quick actions
      </h2>

      {/* Occupancy — editorial bento (Dribbble-style gauge card) */}
      <article
        data-admin-dash-card
        data-bento-item
        className={cn(
          'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
          'bg-card shadow-[0_1px_0_0_color-mix(in_oklch,var(--nestora-sage-muted)_40%,transparent),0_18px_40px_-28px_color-mix(in_srgb,var(--nestora-forest)_35%,transparent)]',
          'lg:col-span-4',
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-gold)_35%,transparent)_0%,transparent_70%)] opacity-80"
          aria-hidden
        />
        <div className="border-b border-[color-mix(in_oklch,var(--nestora-forest)_12%,var(--border))] bg-[linear-gradient(135deg,var(--nestora-forest)_0%,color-mix(in_oklch,var(--nestora-forest)_82%,#0a3428)_100%)] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white">
                <Building2 className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Hostel occupancy</p>
                <p className="text-sm font-semibold text-white">Live bed status</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90">
              {!reduceMotion ? (
                <motion.span
                  className="size-1.5 rounded-full bg-[var(--nestora-gold)]"
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  aria-hidden
                />
              ) : (
                <span className="size-1.5 rounded-full bg-[var(--nestora-gold)]" aria-hidden />
              )}
              Live
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-sm text-muted-foreground">Overall occupancy across all blocks</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] px-2.5 py-1 text-xs font-medium text-[var(--nestora-forest)]">
                <BedDouble className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                <span className="font-semibold tabular-nums">{OCCUPIED}</span> occupied
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-[var(--nestora-tan)]" aria-hidden />
                <span className="font-semibold tabular-nums text-foreground">{available}</span> available
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{TOTAL_ROOMS}</span> total rooms · target{' '}
              <span className="font-semibold text-foreground">85%</span>
            </p>
          </div>
          <OccupancyGauge percent={displayPercent} reduceMotion={reduceMotion} />
        </div>
      </article>

      {/* Quick actions — 2×2 action bento */}
      <article
        data-admin-dash-card
        data-bento-item
        className={cn(
          'overflow-hidden rounded-2xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_22%,var(--card))] p-4 shadow-sm sm:p-5',
          'lg:col-span-8',
        )}
      >
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Quick actions</p>
            <h3 className="text-base font-semibold text-[var(--nestora-forest)]">Common tasks for today</h3>
          </div>
          <p className="text-xs text-muted-foreground">Shortcuts to daily workflows</p>
        </header>

        <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <li key={action.title} className="min-h-0">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + index * 0.05, ease: motionEase }}
                >
                  <Link
                    href={action.href}
                    className={cn(
                      'group relative flex h-full min-h-[4.5rem] items-center gap-3 overflow-hidden rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] px-3 py-3 sm:px-3.5',
                      'bg-[var(--action-surface)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] transition-[border-color,box-shadow] duration-200',
                      'hover:border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] hover:shadow-md',
                      focusRing,
                    )}
                    style={{ '--action-surface': action.surface } as CSSProperties}
                  >
                    <span
                      className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-[0.35] blur-2xl transition-opacity group-hover:opacity-55"
                      style={{ background: action.accent }}
                      aria-hidden
                    />
                    <motion.span
                      className="relative flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ background: `linear-gradient(145deg, ${action.accent}, color-mix(in oklch, ${action.accent} 70%, var(--nestora-forest)))` }}
                      whileHover={reduceMotion ? undefined : { scale: 1.04, rotate: -2 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                    >
                      <Icon className="size-[1.125rem]" aria-hidden />
                    </motion.span>
                    <span className="relative min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{action.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{action.description}</span>
                    </span>
                    <motion.span
                      className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/80 text-[var(--nestora-forest)]"
                      whileHover={reduceMotion ? undefined : { x: 2, y: -2 }}
                      transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                    >
                      <ArrowUpRight className="size-4 opacity-70 transition-opacity group-hover:opacity-100" aria-hidden />
                    </motion.span>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}
