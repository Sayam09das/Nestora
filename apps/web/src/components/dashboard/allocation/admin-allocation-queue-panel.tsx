'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BedDouble, Check, History, User } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { toast } from 'sonner';

import {
  canAllocate,
  formatAllocationDate,
  formatAllocationDateTime,
  type AllocationRecord,
} from '@/components/dashboard/allocation/admin-allocation-data';
import { getStudentInitials } from '@/components/dashboard/students/admin-students-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function statusTone(status: AllocationRecord['status']): string {
  if (status === 'Pending') return 'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_15%,var(--card))]';
  if (status === 'Change Requested') return 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))]';
  return 'border-border bg-muted/40';
}

type Props = {
  queue: AllocationRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAssignBed: (record: AllocationRecord) => void;
  listKey: string;
};

export function AdminAllocationQueuePanel({ queue, selectedId, onSelect, onAssignBed, listKey }: Props) {
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const selected = queue.find((q) => q.id === selectedId) ?? queue[0];

  useGSAP(
    () => {
      if (reduceMotion || !listRef.current) return;
      gsap.from(listRef.current.querySelectorAll('[data-alloc-queue-item]'), {
        opacity: 0,
        x: -8,
        stagger: 0.04,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: listRef, dependencies: [listKey, queue.length, reduceMotion] },
  );

  return (
    <section data-alloc-reveal className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm">
      <motion.header className="border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5" layout="position">
        <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Allocation queue</h2>
        <p className="text-xs text-muted-foreground">Review preferences, then assign an individual bed.</p>
      </motion.header>
      <motion.div className="grid min-h-[28rem] lg:grid-cols-[minmax(0,22rem)_1fr]" layout>
        <motion.div ref={listRef} className="max-h-[32rem] overflow-y-auto border-b lg:border-b-0 lg:border-r border-[var(--nestora-sage-muted)]/70">
          {queue.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Queue is clear.</p>
          ) : (
            <ul>
              {queue.map((row) => {
                const active = row.id === (selected?.id ?? '');
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      data-alloc-queue-item
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
                          <Badge variant="outline" className={cn('shrink-0 rounded-full text-[10px]', statusTone(row.status))}>
                            {row.status}
                          </Badge>
                        </span>
                        <span className="text-xs text-muted-foreground">{row.allocationRef} · {row.type}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.28, ease: motionEase }}
              className="flex flex-col p-5"
            >
              <motion.div className="flex items-start justify-between gap-3" layout="position">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--nestora-forest)]">{selected.studentName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selected.studentId} · {selected.course}
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs"
                  render={<Link href={`/admin/allocation/${selected.id}`} className={focusRing} />}
                >
                  Full record
                </Button>
              </motion.div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Admission gate</dt>
                  <dd className={cn('font-medium', selected.admissionStatus !== 'Fully Approved' && 'text-destructive')}>
                    {selected.admissionStatus}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd>{formatAllocationDateTime(selected.submittedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Preferred hostel</dt>
                  <dd>{selected.preferenceHostel}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Room type · AC</dt>
                  <dd>
                    {selected.preferenceRoomType} · {selected.acPreference}
                  </dd>
                </div>
                {selected.reason ? (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Change reason</dt>
                    <dd>{selected.reason}</dd>
                  </div>
                ) : null}
                {selected.bedId ? (
                  <div className="sm:col-span-2 rounded-xl border border-dashed border-[var(--nestora-sage-muted)] p-3">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <BedDouble className="size-3.5" aria-hidden />
                      Current bed
                    </dt>
                    <dd className="mt-1 font-mono text-sm">
                      {selected.bedId} · Room {selected.roomNumber}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <Button
                  type="button"
                  disabled={!canAllocate(selected)}
                  className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
                  onClick={() => onAssignBed(selected)}
                >
                  <Check className="size-4" aria-hidden />
                  Assign bed
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => toast.message('Rejected (sample UI)')}
                >
                  Reject
                </Button>
              </div>
              {!canAllocate(selected) ? (
                <p className="mt-2 text-[11px] text-destructive">Allocation blocked until admission is Fully Approved.</p>
              ) : null}
              <div className="mt-4 border-t border-[var(--nestora-sage-muted)]/60 pt-4">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  <History className="size-3" aria-hidden />
                  Recent activity
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {selected.history.slice(0, 3).map((h) => (
                    <li key={h.id}>
                      {formatAllocationDate(h.timestamp)} — {h.actor}: {h.action}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
              <User className="mb-2 size-8 opacity-40" aria-hidden />
              Select a queue item
              <ArrowRight className="mt-2 size-4" aria-hidden />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
