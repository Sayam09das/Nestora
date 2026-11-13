'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BedDouble, History, Plane } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { AdminLeaveReviewDrawer } from '@/components/dashboard/leave/admin-leave-review-drawer';
import {
  LEAVE_STATUS_STYLES,
  formatLeaveDate,
  leaveDurationDays,
  type LeaveRecord,
  type LeaveTimelineEntry,
} from '@/components/dashboard/leave/admin-leave-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminLeaveDetailPage({
  record: initial,
  timeline: initialTimeline = [],
}: {
  record: LeaveRecord;
  timeline?: LeaveTimelineEntry[];
}) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [record, setRecord] = useState(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const timeline = initialTimeline;
  const days = leaveDurationDays(record.departureDate, record.expectedReturnDate);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-leave-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, record.id] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-leave-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/leave" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Leave
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Leave / <span className="font-medium text-foreground">{record.leaveRef}</span>
        </p>
      </div>

      <header data-leave-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
              <Plane className="size-6" aria-hidden />
              {record.studentName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {record.hostel} · {record.roomBed}
            </p>
          </div>
          <Badge variant="outline" className={cn('rounded-full', LEAVE_STATUS_STYLES[record.status])}>
            {record.status}
          </Badge>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">Departure</dt>
            <dd className="text-base font-medium tabular-nums">{formatLeaveDate(record.departureDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Expected return</dt>
            <dd className="text-base font-medium tabular-nums">{formatLeaveDate(record.expectedReturnDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Duration</dt>
            <dd className="text-2xl font-semibold tabular-nums">{days}d</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Gate pass</dt>
            <dd className="font-mono text-sm">{record.gatePassToken ?? 'Not issued'}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_10%,var(--card))] p-3 text-xs text-muted-foreground">
          <BedDouble className="size-4 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
          <p>
            Bed allocation remains <span className="font-semibold text-foreground">Occupied</span> for the leave window
            (FR-040). Attendance roster will show <span className="font-semibold text-foreground">On Leave</span> when
            active.
          </p>
        </div>
        {(record.status === 'Pending Review' || record.status === 'Extension Pending') && (
          <Button type="button" className={cn('mt-4 rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={() => setDrawerOpen(true)}>
            Warden review
          </Button>
        )}
      </header>

      <motion.section data-leave-detail className="grid gap-6 lg:grid-cols-[1fr,20rem]" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <article className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Application details</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{record.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Destination</dt>
              <dd className="font-medium">{record.destination}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="leading-relaxed text-muted-foreground">{record.reason}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Emergency contact</dt>
              <dd className="font-medium tabular-nums">{record.emergencyContact}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Submitted</dt>
              <dd>
                <time dateTime={record.submittedAt}>{formatLeaveDate(record.submittedAt)}</time>
              </dd>
            </div>
          </dl>
        </article>

        <aside className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
            <History className="size-4" aria-hidden />
            History
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">FR-044 complete audit trail</p>
          <ol className="mt-4 space-y-4 border-l border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] pl-4">
            {timeline.length === 0 ? (
              <li className="text-xs text-muted-foreground">No timeline entries in sample.</li>
            ) : (
              timeline.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[1.3rem] top-1 size-2.5 rounded-full bg-[var(--nestora-forest)] ring-4 ring-card" aria-hidden />
                  <p className="text-xs font-semibold">{entry.action}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.actor} · <time dateTime={entry.at}>{formatLeaveDate(entry.at)}</time>
                  </p>
                  {entry.notes ? <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p> : null}
                </li>
              ))
            )}
          </ol>
        </aside>
      </motion.section>

      <AdminLeaveReviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        record={record}
        onDecided={(id, decision, _feedback) => {
          if (id !== record.id) return;
          setRecord((r) => ({
            ...r,
            status: decision === 'Approved' ? 'Approved' : 'Rejected',
            reviewedBy: 'Warden (sample)',
            gatePassToken: decision === 'Approved' ? `GP-${Math.random().toString(16).slice(2, 8).toUpperCase()}` : r.gatePassToken,
          }));
        }}
      />
    </div>
  );
}
