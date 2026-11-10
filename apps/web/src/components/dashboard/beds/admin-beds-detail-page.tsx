'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BedDouble, Calendar, ClipboardList, Hammer, History, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  BED_STATUS_HINTS,
  formatBedDate,
  isBedAllocatable,
  type BedRecord,
} from '@/components/dashboard/beds/admin-beds-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminBedsDetailPageProps = {
  bed: BedRecord;
};

export function AdminBedsDetailPage({ bed }: AdminBedsDetailPageProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const allocatable = isBedAllocatable(bed);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-bed-detail-reveal]'), {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, bed.id] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-bed-detail-reveal className="flex flex-wrap items-center gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          className="rounded-xl"
          render={<Link href="/admin/rooms/beds" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Bed Inventory
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Room Management / Bed Inventory / <span className="font-medium text-foreground">{bed.bedId}</span>
        </p>
      </div>

      <header
        data-bed-detail-reveal
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Bed details</p>
            <h1 className="mt-1 font-mono text-2xl font-semibold text-[var(--nestora-forest)]">{bed.bedId}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {bed.bedLabel} · {bed.bedType} · {BED_STATUS_HINTS[bed.status]}
            </p>
            <Badge variant="outline" className="mt-2 rounded-full font-semibold">
              {bed.status}
            </Badge>
            {bed.roomUnderMaintenance ? (
              <p className="mt-2 text-xs font-medium text-[var(--nestora-gold)]">
                Parent room is under maintenance — beds cannot be allocated until the room is cleared.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-xl">
              Change status
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[var(--nestora-forest)] text-white"
              disabled={!allocatable}
            >
              Assign student
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 p-3">
            <dt className="text-[10px] font-bold uppercase text-muted-foreground">Hostel</dt>
            <dd className="mt-1 text-sm font-semibold">{bed.hostel}</dd>
          </div>
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 p-3">
            <dt className="text-[10px] font-bold uppercase text-muted-foreground">Location</dt>
            <dd className="mt-1 text-sm font-semibold">
              {bed.block} · {bed.floor}
            </dd>
            <dd className="text-xs text-muted-foreground">
              Room{' '}
              <Link href={`/admin/rooms/${bed.roomId}`} className={cn('font-medium text-[var(--nestora-forest)] hover:underline', focusRing)}>
                {bed.roomNumber}
              </Link>
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 p-3">
            <dt className="text-[10px] font-bold uppercase text-muted-foreground">Allocation</dt>
            <dd className="mt-1 text-sm font-semibold">{bed.allocationDate ? formatBedDate(bed.allocationDate) : '—'}</dd>
            <dd className="text-xs text-muted-foreground">
              Checkout {bed.expectedCheckout ? formatBedDate(bed.expectedCheckout) : '—'}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 p-3">
            <dt className="text-[10px] font-bold uppercase text-muted-foreground">Student</dt>
            <dd className="mt-1 text-sm font-semibold">{bed.student?.name ?? 'Unassigned'}</dd>
            <dd className="font-mono text-xs text-muted-foreground">{bed.student?.studentId ?? '—'}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          data-bed-detail-reveal
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5"
          aria-labelledby="bed-student-heading"
        >
          <h2 id="bed-student-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <UserRound className="size-4" aria-hidden />
            Assigned student
          </h2>
          {bed.student ? (
            <motion.div
              className="mt-4 rounded-xl border border-[var(--nestora-sage-muted)] p-4"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: motionEase }}
            >
              <p className="font-semibold">{bed.student.name}</p>
              <p className="font-mono text-sm text-muted-foreground">{bed.student.studentId}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" aria-hidden />
                Since {bed.allocationDate ? formatBedDate(bed.allocationDate) : '—'}
              </p>
            </motion.div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No student on this bed.</p>
          )}
        </section>

        <section
          data-bed-detail-reveal
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5"
          aria-labelledby="bed-reservation-heading"
        >
          <h2 id="bed-reservation-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <ClipboardList className="size-4" aria-hidden />
            Reservation
          </h2>
          {bed.reservation ? (
            <div className="mt-4 space-y-2 rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))] p-4 text-sm">
              <p>
                Ref <span className="font-mono font-semibold">{bed.reservation.reference}</span>
              </p>
              <p className="text-muted-foreground">Review by {formatBedDate(bed.reservation.reviewDate)}</p>
              {bed.reservation.note ? <p className="text-xs text-muted-foreground">{bed.reservation.note}</p> : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No active reservation.</p>
          )}
        </section>

        <section
          data-bed-detail-reveal
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5"
          aria-labelledby="bed-maintenance-heading"
        >
          <h2 id="bed-maintenance-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <Hammer className="size-4" aria-hidden />
            Maintenance history
          </h2>
          {bed.maintenanceHistory.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No maintenance tickets.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {bed.maintenanceHistory.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-[var(--nestora-sage-muted)] p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">{entry.title}</span>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {entry.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatBedDate(entry.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          data-bed-detail-reveal
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5"
          aria-labelledby="bed-status-history-heading"
        >
          <h2 id="bed-status-history-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <History className="size-4" aria-hidden />
            Status change history
          </h2>
          {bed.statusHistory.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No status changes logged.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {bed.statusHistory.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-[var(--nestora-sage-muted)] px-3 py-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">{entry.from}</span> →{' '}
                    <span className="font-semibold">{entry.to}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBedDate(entry.date)} · {entry.actor}
                    {entry.note ? ` — ${entry.note}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside
        data-bed-detail-reveal
        className="flex items-start gap-3 rounded-2xl border border-dashed border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4 text-xs text-muted-foreground"
      >
        <BedDouble className="size-4 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
        <p>
          One bed, one room, one student at a time. Occupied beds cannot return to Available until allocation ends.
          Reserved beds require a reference and review date. Room occupancy updates automatically when bed allocations
          change (API).
        </p>
      </aside>
    </div>
  );
}
