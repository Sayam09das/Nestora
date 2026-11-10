'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ClipboardList, History } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  SAMPLE_REVISIONS,
  formatAttendanceDate,
  formatAttendanceDateTime,
  sessionRate,
  type AttendanceSession,
} from '@/components/dashboard/attendance/admin-attendance-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminAttendanceDetailPage({ session }: { session: AttendanceSession }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rate = sessionRate(session);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-att-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, session.id] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-att-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/attendance" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Attendance
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Attendance / <span className="font-medium text-foreground">{formatAttendanceDate(session.date)}</span>
        </p>
      </div>

      <header data-att-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
              <ClipboardList className="size-6" aria-hidden />
              {session.hostel}
            </h1>
            <p className="text-sm text-muted-foreground">
              {session.block} · {session.floor} · {formatAttendanceDate(session.date)}
            </p>
          </div>
          <Badge variant="outline" className="rounded-full">
            {session.status}
          </Badge>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground text-sm">Present</dt>
            <dd className="text-2xl font-semibold tabular-nums">{session.present}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Absent</dt>
            <dd className="text-2xl font-semibold tabular-nums">{session.absent}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">On leave</dt>
            <dd className="text-2xl font-semibold tabular-nums">{session.onLeave}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Attendance rate</dt>
            <dd className="text-2xl font-semibold tabular-nums">{rate}%</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Submitted by {session.submittedBy} · {formatAttendanceDateTime(session.submittedAt)}
        </p>
      </header>

      <section data-att-detail className="rounded-2xl border bg-card p-5" aria-labelledby="att-rev-heading">
        <h2 id="att-rev-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
          <History className="size-4" aria-hidden />
          Sample revisions (FR-047)
        </h2>
        <ul className="mt-4 space-y-3 border-t border-[var(--nestora-sage-muted)]/60 pt-4 text-sm">
          {SAMPLE_REVISIONS.map((rev) => (
            <li key={rev.id} className="rounded-xl border border-[var(--nestora-sage-muted)]/50 p-3">
              <p className="text-xs text-muted-foreground">{formatAttendanceDateTime(rev.timestamp)} · {rev.editor}</p>
              <p className="mt-1">
                <span className="font-mono text-xs">{rev.studentId}</span>: {rev.from} → <strong>{rev.to}</strong>
              </p>
              <p className="text-xs text-muted-foreground">{rev.reason}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Corrections keep prior values, editor identity, and timestamps in the audit trail.
        </p>
      </section>
    </div>
  );
}
