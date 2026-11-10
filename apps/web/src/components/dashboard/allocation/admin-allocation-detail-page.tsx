'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Bed, History, User } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  formatAllocationDate,
  formatAllocationDateTime,
  type AllocationRecord,
} from '@/components/dashboard/allocation/admin-allocation-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminAllocationDetailPage({ record }: { record: AllocationRecord }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-alloc-detail]'), {
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
      <div data-alloc-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/allocation" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Room Allocation
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Room Allocation / <span className="font-medium text-foreground">{record.allocationRef}</span>
        </p>
      </div>

      <header data-alloc-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">{record.studentName}</h1>
            <p className="text-sm text-muted-foreground">
              {record.allocationRef} · {record.type}
            </p>
            <Badge variant="outline" className="mt-2 rounded-full">
              {record.status}
            </Badge>
          </div>
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Admission</p>
            <p className="font-medium">{record.admissionStatus}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section data-alloc-detail className="rounded-2xl border bg-card p-5" aria-labelledby="alloc-student-heading">
          <h2 id="alloc-student-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <User className="size-4" aria-hidden />
            Student &amp; preferences
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Student ID</dt>
              <dd className="font-mono">{record.studentId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Course</dt>
              <dd>{record.course}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Gender hostel</dt>
              <dd>{record.genderHostelCategory}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Preferences</dt>
              <dd>
                {record.preferenceHostel} · {record.preferenceRoomType} · {record.acPreference}
              </dd>
            </div>
            {record.reason ? (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Reason</dt>
                <dd>{record.reason}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section data-alloc-detail className="rounded-2xl border bg-card p-5" aria-labelledby="alloc-bed-heading">
          <h2 id="alloc-bed-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <Bed className="size-4" aria-hidden />
            Bed assignment
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Hostel</dt>
              <dd>{record.hostel ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Room</dt>
              <dd>{record.roomNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Bed</dt>
              <dd className="font-mono">{record.bedId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Allocated by</dt>
              <dd>{record.allocatedBy ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Allocated at</dt>
              <dd>{record.allocatedAt ? formatAllocationDateTime(record.allocatedAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Expected checkout</dt>
              <dd>{record.expectedCheckout ? formatAllocationDate(record.expectedCheckout) : '—'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Historical allocation logs are immutable (FR-031). Reallocation releases the previous bed to Available in one
            atomic step (FR-030).
          </p>
        </section>
      </div>

      <section data-alloc-detail className="rounded-2xl border bg-card p-5" aria-labelledby="alloc-hist-heading">
        <h2 id="alloc-hist-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
          <History className="size-4" aria-hidden />
          Modification history
        </h2>
        <ul className="mt-4 space-y-3 border-t border-[var(--nestora-sage-muted)]/60 pt-4 text-sm">
          {record.history.map((h) => (
            <li key={h.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <span className="shrink-0 tabular-nums text-muted-foreground">{formatAllocationDateTime(h.timestamp)}</span>
              <span className="font-medium text-foreground">{h.actor}</span>
              <span className="text-muted-foreground">{h.action}</span>
              {h.note ? <span className="text-xs text-muted-foreground">({h.note})</span> : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">Submitted {formatAllocationDateTime(record.submittedAt)}</p>
      </section>
    </div>
  );
}
