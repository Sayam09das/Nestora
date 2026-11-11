'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Loader2, User } from 'lucide-react';
import { useMemo, useRef } from 'react';

import {
  isRoomAssignable,
  roomAvailableBeds,
  roomOccupancyPercent,
  type RoomOperationalStatus,
  type RoomRecord,
} from '@/components/dashboard/rooms/admin-rooms-data';
import type { BedRecord, BedStatus } from '@/components/dashboard/beds/admin-beds-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function statusBadge(status: RoomOperationalStatus) {
  const styles: Record<RoomOperationalStatus, string> = {
    Available:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))]',
    Full: 'border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))] bg-muted/50',
    Maintenance:
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))]',
    Inactive: 'border-border bg-muted/40',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full text-[10px] font-semibold', styles[status])}>
      {status}
    </Badge>
  );
}

function bedTone(status: BedStatus): string {
  if (status === 'Available') return 'border-[#6d9773] bg-[color-mix(in_oklch,#6d9773_18%,var(--card))] text-[var(--nestora-forest)]';
  if (status === 'Occupied') return 'border-[var(--nestora-forest)] bg-[color-mix(in_oklch,var(--nestora-forest)_10%,var(--card))]';
  if (status === 'Reserved') return 'border-[var(--nestora-gold)] bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))]';
  return 'border-border bg-muted/50 text-muted-foreground';
}

type Props = {
  rooms: RoomRecord[];
  bedsByRoomId: Map<string, BedRecord[]>;
  loading: boolean;
  onOpenRoom: (room: RoomRecord) => void;
  onAssignBedInRoom: (room: RoomRecord) => void;
};

export function WardenRoomsMatrix({ rooms, bedsByRoomId, loading, onOpenRoom, onAssignBedInRoom }: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLUListElement>(null);

  const sorted = useMemo(
    () => [...rooms].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })),
    [rooms],
  );

  useGSAP(
    () => {
      if (reduceMotion || !gridRef.current || loading) return;
      gsap.from(gridRef.current.querySelectorAll('[data-warden-room-card]'), {
        opacity: 0,
        scale: 0.92,
        y: 16,
        duration: 0.4,
        stagger: { each: 0.06, from: 'start', grid: 'auto' },
        ease: 'back.out(1.2)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: gridRef, dependencies: [reduceMotion, loading, sorted.length] },
  );

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading bed matrix…
      </p>
    );
  }

  if (sorted.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-12 text-center text-sm text-muted-foreground">
        No rooms match these filters for this hostel.
      </p>
    );
  }

  return (
    <ul ref={gridRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {sorted.map((room) => {
        const beds = bedsByRoomId.get(room.id) ?? [];
        const open = roomAvailableBeds(room);
        const occPct = roomOccupancyPercent(room);
        return (
          <li key={room.id} data-warden-room-card>
            <motion.article
              whileHover={reduceMotion ? undefined : { y: -3 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-4 shadow-sm"
            >
              <motion.header className="flex items-start justify-between gap-2">
                <motion.div>
                  <p className="text-lg font-semibold text-[var(--nestora-forest)]">{room.roomNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {room.block} · {room.floor} · {room.roomType}
                  </p>
                </motion.div>
                {statusBadge(room.operationalStatus)}
              </motion.header>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {room.occupiedBeds}/{room.capacity} beds
                </span>
                <span className="font-semibold tabular-nums text-foreground">{occPct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e7e7dc]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#6d9773,var(--nestora-forest))]"
                  style={{ width: `${occPct}%` }}
                />
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {beds.length > 0
                  ? beds.map((bed) => (
                      <li
                        key={bed.id}
                        className={cn('rounded-xl border px-2 py-2 text-[11px] font-medium', bedTone(bed.status))}
                      >
                        <p className="flex items-center gap-1">
                          <BedDouble className="size-3 shrink-0" aria-hidden />
                          Bed {bed.bedNumber}
                        </p>
                        <p className="mt-0.5 truncate text-muted-foreground">
                          {bed.student ? (
                            <span className="inline-flex items-center gap-0.5">
                              <User className="size-2.5" aria-hidden />
                              {bed.student.name}
                            </span>
                          ) : (
                            bed.status
                          )}
                        </p>
                      </li>
                    ))
                  : Array.from({ length: room.capacity }, (_, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-2 py-2 text-[11px] text-muted-foreground"
                      >
                        Slot {i + 1}
                      </li>
                    ))}
              </ul>
              <div className="mt-auto flex gap-2 pt-4">
                <Button type="button" variant="outline" size="sm" className={cn('flex-1 rounded-xl', focusRing)} onClick={() => onOpenRoom(room)}>
                  Details
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!isRoomAssignable(room) || open === 0}
                  className={cn('flex-1 rounded-xl bg-[var(--nestora-forest)]', focusRing)}
                  onClick={() => onAssignBedInRoom(room)}
                >
                  Assign
                </Button>
              </div>
            </motion.article>
          </li>
        );
      })}
    </ul>
  );
}
