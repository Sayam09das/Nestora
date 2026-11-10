'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarCheck,
  Megaphone,
  MessageSquareWarning,
  Shield,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { AdminDashboardOverview } from '@/lib/api/dashboard';
import { formatAnnouncementMeta } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminDashboardSignalsRowProps = {
  overview: AdminDashboardOverview | null;
  loading?: boolean;
};

export function AdminDashboardSignalsRow({ overview, loading = false }: AdminDashboardSignalsRowProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const attendance = overview?.attendanceToday;
  const attendancePercent = attendance?.percent;
  const attendanceBarWidth =
    attendancePercent == null ? '0%' : `${Math.min(Math.max(attendancePercent, 0), 100)}%`;

  const announcements = overview?.announcements;
  const liveCount = announcements?.liveCount ?? 0;
  const noticeItems = useMemo(() => {
    const recent = announcements?.recent ?? [];
    if (recent.length > 0) {
      return recent.map((item) => ({
        id: item.id,
        title: item.title,
        meta: formatAnnouncementMeta(item.postedAt),
      }));
    }
    return [
      {
        id: 'placeholder-mod17',
        title: 'Notices go live with MOD-17',
        meta: 'Publish from Announcements when the module is connected',
      },
    ];
  }, [announcements?.recent]);

  const ops = overview?.operations;
  const openComplaints = ops?.openComplaints ?? 0;
  const pendingLeave = ops?.pendingLeave ?? 0;
  const avgResponse =
    ops?.avgResponseHours == null ? '—' : `${ops.avgResponseHours}h`;

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-signal-card]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} className="space-y-3" aria-labelledby="admin-signals-heading">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Today</p>
        <h2 id="admin-signals-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
          Campus signals
        </h2>
        {loading && !overview ? (
          <p className="text-xs text-muted-foreground">Syncing campus signals…</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article
          data-admin-dash-card
          data-signal-card
          className="flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card shadow-sm"
        >
          <div className="border-b border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-sage-light)_35%,var(--card))] px-4 py-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              <p className="text-sm font-semibold text-[var(--nestora-forest)]">Attendance today</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-[var(--nestora-forest)]">
              {attendancePercent == null ? '—' : `${attendancePercent}%`}
            </p>
            <p className="text-xs text-muted-foreground">
              {attendance == null ? (
                'Loading…'
              ) : attendance.present + attendance.absent + attendance.onLeave === 0 ? (
                'No attendance marked yet today'
              ) : (
                <>
                  <span className="font-semibold text-foreground">{attendance.present}</span> checked in ·{' '}
                  <span className="font-semibold text-foreground">{attendance.absent}</span> absent
                  {attendance.onLeave > 0 ? (
                    <>
                      {' '}
                      · <span className="font-semibold text-foreground">{attendance.onLeave}</span> on leave
                    </>
                  ) : null}
                </>
              )}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--nestora-sage-muted)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--nestora-sage),var(--nestora-forest))] transition-[width] duration-500"
                style={{ width: attendanceBarWidth }}
                role="progressbar"
                aria-valuenow={attendancePercent ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Attendance rate today"
              />
            </div>
            <Link
              href="/admin/attendance"
              className={cn(
                'mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--nestora-forest)]',
                focusRing,
              )}
            >
              Mark attendance
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </article>

        <article
          data-admin-dash-card
          data-signal-card
          className="flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_25%,var(--border))] bg-card shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))] px-4 py-3">
            <div className="flex items-center gap-2">
              <Megaphone className="size-4 text-[var(--nestora-tan)]" aria-hidden />
              <p className="text-sm font-semibold text-[var(--nestora-forest)]">Announcements</p>
            </div>
            <span className="rounded-full bg-[var(--nestora-forest)] px-2 py-0.5 text-[10px] font-bold text-white">
              {liveCount} live
            </span>
          </div>
          <ul className="flex-1 space-y-0 divide-y divide-[var(--nestora-sage-muted)]/50 p-2">
            {noticeItems.map((item) => (
              <li key={item.id}>
                <motion.div whileHover={reduceMotion ? undefined : { x: 2 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
                  <Link
                    href="/admin/announcements"
                    className={cn('block rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40', focusRing)}
                  >
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{item.meta}</p>
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--nestora-sage-muted)]/70 p-3">
            <Link
              href="/admin/announcements"
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nestora-sage-muted)] px-3 py-2 text-sm font-semibold text-[var(--nestora-forest)]',
                'hover:bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))]',
                focusRing,
              )}
            >
              <Sparkles className="size-4 text-[var(--nestora-gold)]" aria-hidden />
              New announcement
            </Link>
          </div>
        </article>

        <article
          data-admin-dash-card
          data-signal-card
          className="flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-forest)_15%,var(--border))] bg-card shadow-sm"
        >
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,var(--nestora-forest)_0%,#0a3428_100%)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-[var(--nestora-gold)]" aria-hidden />
              <p className="text-sm font-semibold text-white">Operations health</p>
            </div>
          </div>
          <ul className="flex-1 space-y-2 p-4 text-sm">
            <li className="flex items-center justify-between gap-2 rounded-lg border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))] px-3 py-2">
              <span className="text-muted-foreground">Open complaints</span>
              <Link href="/admin/complaints" className={cn('font-bold tabular-nums text-[var(--nestora-forest)]', focusRing)}>
                {overview == null ? '—' : openComplaints}
              </Link>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg border border-[var(--nestora-sage-muted)] px-3 py-2">
              <span className="text-muted-foreground">Leave pending</span>
              <Link href="/admin/leave" className={cn('font-bold tabular-nums text-[var(--nestora-forest)]', focusRing)}>
                {overview == null ? '—' : pendingLeave}
              </Link>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg border border-[var(--nestora-sage-muted)] px-3 py-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MessageSquareWarning className="size-3.5 text-[var(--nestora-tan)]" aria-hidden />
                Avg. response
              </span>
              <span className="font-semibold tabular-nums text-[var(--nestora-forest)]">{avgResponse}</span>
            </li>
          </ul>
          <motion.div
            className="border-t border-[var(--nestora-sage-muted)]/70 p-3"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/admin/reports"
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color-mix(in_oklch,var(--nestora-forest)_92%,black)] px-3 py-2 text-sm font-semibold text-white',
                'hover:brightness-110',
                focusRing,
              )}
            >
              Ops report
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </motion.div>
        </article>
      </div>
    </section>
  );
}
