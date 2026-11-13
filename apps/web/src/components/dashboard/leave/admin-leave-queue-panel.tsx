'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowRight, BedDouble, Check, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  LEAVE_STATUS_STYLES,
  formatLeaveDate,
  leaveDurationDays,
  type LeaveRecord,
} from '@/components/dashboard/leave/admin-leave-data';
import { getStudentInitials } from '@/components/dashboard/students/admin-students-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  queue: LeaveRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  onReview: (record: LeaveRecord) => void;
  listKey: string;
  hidden?: boolean;
};

function DateSpanBar({ record }: { record: LeaveRecord }) {
  const days = leaveDurationDays(record.departureDate, record.expectedReturnDate);
  return (
    <div className="mt-2 space-y-1" aria-label={`${days} day leave window`}>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{formatLeaveDate(record.departureDate)}</span>
        <span>{formatLeaveDate(record.expectedReturnDate)}</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-[#e7e7dc]">
        <motion.div
          className="absolute inset-y-0 left-[8%] right-[12%] rounded-full bg-gradient-to-r from-[var(--nestora-sage)] to-[var(--nestora-forest)]"
          initial={false}
          layout
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{days} nights · bed retained</p>
    </div>
  );
}

export function AdminLeaveQueuePanel({ queue, selectedId, onSelect, onReview, listKey, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const selected = queue.find((q) => q.id === selectedId) ?? queue[0];

  useGSAP(
    () => {
      if (reduceMotion || !listRef.current || hidden) return;
      gsap.from(listRef.current.querySelectorAll('[data-leave-queue-item]'), {
        opacity: 0,
        x: -8,
        stagger: 0.04,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: listRef, dependencies: [listKey, queue.length, reduceMotion, hidden] },
  );

  return (
    <section
      data-leave-reveal
      data-leave-flip
      aria-label="Warden queue"
      hidden={hidden}
      className={cn(
        'overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm',
        hidden && 'hidden',
      )}
    >
      <header className="border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Warden queue</h2>
        <p className="text-xs text-muted-foreground">Overstays and extensions surface first; beds stay occupied when approved.</p>
      </header>
      <motion.div className="grid min-h-[28rem] lg:grid-cols-[minmax(0,22rem)_1fr]" layout>
        <div ref={listRef} className="max-h-[32rem] overflow-y-auto border-b lg:border-b-0 lg:border-r border-[var(--nestora-sage-muted)]/70">
          {queue.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No items in queue.</p>
          ) : (
            <ul>
              {queue.map((row) => {
                const active = row.id === (selected?.id ?? '');
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      data-leave-queue-item
                      onClick={() => onSelect(row.id)}
                      className={cn(
                        'flex w-full gap-3 border-b border-[var(--nestora-sage-muted)]/50 px-4 py-3 text-left transition-colors',
                        active ? 'bg-[color-mix(in_oklch,var(--nestora-sage-light)_35%,var(--card))]' : 'hover:bg-muted/30',
                        focusRing,
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-xs font-bold text-white">
                        {getStudentInitials(row.studentName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-foreground">{row.studentName}</span>
                          <Badge variant="outline" className={cn('shrink-0 rounded-full text-[10px]', LEAVE_STATUS_STYLES[row.status])}>
                            {row.status}
                          </Badge>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {row.leaveRef} · {row.category}
                        </span>
                        <DateSpanBar record={row} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex flex-col p-4 sm:p-5">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">{selected.leaveRef}</p>
                  <h3 className="text-lg font-semibold text-[var(--nestora-forest)]">{selected.studentName}</h3>
                  <p className="text-xs text-muted-foreground">{selected.roomBed}</p>
                </div>
                {selected.lateReturn ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
                    <AlertTriangle className="size-3" aria-hidden />
                    Late return
                  </span>
                ) : null}
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
                  <div>
                    <dt className="text-xs text-muted-foreground">Destination</dt>
                    <dd className="font-medium">{selected.destination}</dd>
                  </div>
                </div>
                <div className="flex gap-2">
                  <BedDouble className="mt-0.5 size-4 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
                  <div>
                    <dt className="text-xs text-muted-foreground">Bed status</dt>
                    <dd className="font-medium">{selected.bedRetained ? 'Occupied (retained)' : '—'}</dd>
                  </div>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{selected.reason}</p>
              <p className="mt-2 text-xs text-muted-foreground">Emergency: {selected.emergencyContact}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {(selected.status === 'Pending Review' || selected.status === 'Extension Pending') && (
                  <>
                    <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={() => onReview(selected)}>
                      <Check className="size-4" aria-hidden />
                      Review
                    </Button>
                    <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} onClick={() => onReview(selected)}>
                      <X className="size-4" aria-hidden />
                      Decline
                    </Button>
                  </>
                )}
                <Button
                  nativeButton={false}
                  variant="secondary"
                  className={cn('rounded-xl', focusRing)}
                  render={<Link href={`/admin/leave/${selected.id}`} />}
                >
                  Open record
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            </>
          ) : (
            <p className="m-auto text-sm text-muted-foreground">Select a queue item.</p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
