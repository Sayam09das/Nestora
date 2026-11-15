'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightLeft, Check, Loader2, X } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import {
  canAllocate,
  formatAllocationDate,
  type AllocationRecord,
} from '@/components/dashboard/allocation/admin-allocation-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rejectRoomChange, type RoomChangeRequestRow } from '@/lib/api/room-changes';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  queue: AllocationRecord[];
  pendingChanges: AllocationRecord[];
  roomChanges: RoomChangeRequestRow[];
  loading: boolean;
  onAssign: (record: AllocationRecord) => void;
  onApproveRoomChange: (row: RoomChangeRequestRow) => void;
  onRoomChangesUpdated: () => void;
};

export function WardenRoomsRequests({
  queue,
  pendingChanges,
  roomChanges,
  loading,
  onAssign,
  onApproveRoomChange,
  onRoomChangesUpdated,
}: Props) {
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !listRef.current || loading) return;
      gsap.from(listRef.current.querySelectorAll('[data-warden-req-row]'), {
        opacity: 0,
        y: 8,
        stagger: 0.05,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: listRef, dependencies: [loading, queue.length, reduceMotion] },
  );

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading requests…
      </p>
    );
  }

  return (
    <div ref={listRef} className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_28%,var(--border))] bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">New allocation queue</h2>
        <p className="text-xs text-muted-foreground">Fully approved residents awaiting a bed (FR-025).</p>
        <ul className="mt-4 space-y-2">
          {queue.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
              Queue is clear.
            </li>
          ) : (
            queue.map((row) => (
              <li
                key={row.id}
                data-warden-req-row
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-3"
              >
                <motion.div className="min-w-0">
                  <p className="text-sm font-semibold">{row.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.studentId} · prefers {row.preferenceRoomType} · {row.acPreference}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Submitted {formatAllocationDate(row.submittedAt)}</p>
                </motion.div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!canAllocate(row)}
                  className="rounded-xl bg-[var(--nestora-forest)]"
                  onClick={() => onAssign(row)}
                >
                  Assign bed
                </Button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
          <ArrowRightLeft className="size-4 text-[var(--nestora-sage)]" aria-hidden />
          Room change requests
        </h2>
        <p className="text-xs text-muted-foreground">Approve or reject with atomic reallocation (FR-030).</p>
        <ul className="mt-4 space-y-2">
          {roomChanges.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
              No pending room changes.
            </li>
          ) : (
            roomChanges.map((row) => (
              <li
                key={row.id}
                data-warden-req-row
                className="rounded-xl border border-border/70 bg-card px-3 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{row.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.currentHostel} {row.currentRoom} bed {row.currentBed} → {row.preferredConfigLabel}
                    </p>
                    <p className="mt-1 text-xs italic text-muted-foreground">&ldquo;{row.reason}&rdquo;</p>
                  </div>
                  <Badge variant="outline" className="rounded-full font-semibold">
                    {row.status}
                  </Badge>
                </div>
                <motion.div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn('rounded-xl', focusRing)}
                    onClick={() => {
                      const remarks = window.prompt('Rejection remarks (min 8 chars)');
                      if (!remarks || remarks.trim().length < 8) return;
                      void rejectRoomChange(row.id, remarks.trim()).then((result) => {
                        if (result.error) toast.error(result.error);
                        else {
                          toast.message('Room change rejected');
                          onRoomChangesUpdated();
                        }
                      });
                    }}
                  >
                    <X className="size-3.5" aria-hidden />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl bg-[var(--nestora-forest)]"
                    onClick={() => onApproveRoomChange(row)}
                  >
                    <Check className="size-3.5" aria-hidden />
                    Approve &amp; assign bed
                  </Button>
                </motion.div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
