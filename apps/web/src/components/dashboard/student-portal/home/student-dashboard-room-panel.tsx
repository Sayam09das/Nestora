'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, ChevronRight, DoorOpen } from 'lucide-react';
import Link from 'next/link';

import type { StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: StudentDashboardSnapshot };

export function StudentDashboardRoomPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="student-room-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <DoorOpen className="size-4 text-[var(--nestora-sage)]" aria-hidden />
          <h2 id="student-room-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            My Room Details
          </h2>
        </div>
        <Badge
          variant="outline"
          className="border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] capitalize text-[var(--nestora-forest)]"
        >
          {snapshot.roomStatus}
        </Badge>
      </div>

      <p className="mt-2 text-sm font-medium text-foreground">{snapshot.hostelName}</p>
      <p className="text-sm text-muted-foreground">
        {snapshot.block} · {snapshot.floor}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2" role="list" aria-label="Room allocation">
        {[
          { label: 'Room', value: snapshot.roomNumber },
          { label: 'Bed', value: snapshot.bedNumber },
          { label: 'Capacity', value: String(snapshot.capacity).padStart(2, '0') },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            role="listitem"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.28, ease: motionEase }}
            className="rounded-xl border border-border bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-3 text-center"
          >
            <p className="text-xl font-bold tabular-nums text-[var(--nestora-forest)]">{item.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">My Roommates</p>
        <ul className="mt-3 space-y-2">
          {snapshot.roommates.map((mate, index) => (
            <motion.li
              key={mate.id}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3, ease: motionEase }}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-xs font-bold text-white"
                aria-hidden
              >
                {mate.initials}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{mate.name}</span>
                <span className="block text-xs text-muted-foreground">{mate.program}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <Link
        href="/student/room"
        className={cn(
          'mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--nestora-forest)] hover:underline',
          focusRing,
        )}
      >
        View Room Details
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </motion.section>
  );
}
