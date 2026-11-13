'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BedDouble, Building2, Hammer, Shield, Sparkles, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminRoomAssignSheet } from '@/components/dashboard/rooms/admin-room-assign-sheet';
import { AdminRoomEditSheet } from '@/components/dashboard/rooms/admin-room-edit-sheet';
import {
  formatMaintenanceDate,
  roomAvailableBeds,
  roomOccupancyPercent,
  type RoomRecord,
} from '@/components/dashboard/rooms/admin-rooms-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const BAR_GREEN = '#6d9773';
const BAR_GOLD = '#ffba00';
const BAR_TRACK = '#e7e7dc';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminRoomsDetailPageProps = {
  room: RoomRecord;
  autoOpenEdit?: boolean;
  onRoomUpdated?: () => void | Promise<void>;
};

function StatusPill({ status }: { status: RoomRecord['operationalStatus'] }) {
  const tone =
    status === 'Maintenance'
      ? 'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))]'
      : status === 'Available'
        ? 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))]'
        : status === 'Full'
          ? 'border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_8%,var(--card))]'
          : 'border-border bg-muted/60';
  return (
    <Badge variant="outline" className={cn('rounded-full px-3 py-1 text-sm font-semibold text-[var(--nestora-forest)]', tone)}>
      {status}
    </Badge>
  );
}

export function AdminRoomsDetailPage({ room, autoOpenEdit = false, onRoomUpdated }: AdminRoomsDetailPageProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [editOpen, setEditOpen] = useState(autoOpenEdit);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#residents') {
      return;
    }
    const timer = window.setTimeout(() => {
      document.getElementById('residents')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [room.id]);

  const occupancyPct = useMemo(() => roomOccupancyPercent(room), [room]);
  const availableBeds = roomAvailableBeds(room);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) {
        return;
      }
      gsap.from(rootRef.current.querySelectorAll('[data-room-detail-reveal]'), {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
      gsap.from(rootRef.current.querySelector('[data-room-detail-bar]'), {
        scaleX: 0,
        duration: 0.7,
        ease: 'power3.out',
        transformOrigin: 'left center',
        clearProps: 'transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, room.id] },
  );

  const barColor = room.operationalStatus === 'Maintenance' ? BAR_GOLD : BAR_GREEN;

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-room-detail-reveal className="flex flex-wrap items-center gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          className="rounded-xl border-[var(--nestora-sage-muted)]"
          render={<Link href="/admin/rooms" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          All Rooms
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Room Management / <span className="font-medium text-foreground">{room.roomNumber}</span>
        </p>
      </div>

      <header
        data-room-detail-reveal
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Room details</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--nestora-forest)]">{room.roomNumber}</h1>
              <StatusPill status={room.operationalStatus} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {room.hostel} · {room.block} · {room.floor} · {room.roomType}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Room ID {room.roomId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-[var(--nestora-sage-muted)]"
              onClick={() => setEditOpen(true)}
            >
              Edit room
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[var(--nestora-forest)] text-white hover:brightness-110"
              disabled={
                room.operationalStatus === 'Maintenance' ||
                room.operationalStatus === 'Inactive' ||
                availableBeds <= 0
              }
              onClick={() => setAssignOpen(true)}
            >
              Assign student
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Capacity</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{room.capacity}</p>
            <p className="text-xs text-muted-foreground">beds maximum</p>
          </div>
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 bg-[color-mix(in_oklch,var(--nestora-sage-light)_25%,var(--card))] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Occupied</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{room.occupiedBeds}</p>
            <p className="text-xs text-muted-foreground">allocated beds</p>
          </div>
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Available</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{availableBeds}</p>
            <p className="text-xs text-muted-foreground">
              {room.operationalStatus === 'Maintenance' || room.operationalStatus === 'Inactive'
                ? 'not assignable while blocked'
                : 'open for assignment'}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--nestora-sage-muted)]/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Fill rate</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{occupancyPct}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: BAR_TRACK }}>
              <div
                data-room-detail-bar
                className="h-full rounded-full"
                style={{ width: `${occupancyPct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          data-room-detail-reveal
          id="residents"
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
          aria-labelledby="room-residents-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <BedDouble className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <h2 id="room-residents-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Allocated students
            </h2>
          </div>
          {room.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students assigned to this room yet.</p>
          ) : (
            <ul className="space-y-3">
              {room.students.map((student, index) => (
                <motion.li
                  key={student.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3, ease: motionEase }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.studentId}</p>
                  </div>
                  <span className="rounded-full border border-[var(--nestora-sage-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--nestora-forest)]">
                    {student.bedLabel}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        <section
          data-room-detail-reveal
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
          aria-labelledby="room-warden-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <Shield className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <h2 id="room-warden-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Hostel warden
            </h2>
          </div>
          <motion.div
            className="flex items-center gap-3 rounded-xl border border-[var(--nestora-sage-muted)]/80 p-4"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))]">
              <UserRound className="size-5 text-[var(--nestora-forest)]" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-foreground">{room.wardenName}</p>
              <p className="text-xs text-muted-foreground">Responsible for {room.hostel}</p>
            </div>
          </motion.div>
        </section>

        <section
          data-room-detail-reveal
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
          aria-labelledby="room-facilities-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <h2 id="room-facilities-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Room facilities
            </h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {room.facilities.map((item) => (
              <li
                key={item}
                className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_30%,var(--card))] px-3 py-1 text-xs font-medium text-[var(--nestora-forest)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section
          data-room-detail-reveal
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
          aria-labelledby="room-maintenance-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <Hammer className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <h2 id="room-maintenance-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Maintenance history
            </h2>
          </div>
          {room.maintenanceHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No maintenance tickets on record.</p>
          ) : (
            <ul className="space-y-3">
              {room.maintenanceHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_8%,var(--card))] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {entry.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatMaintenanceDate(entry.date)}</p>
                  {entry.notes ? <p className="mt-2 text-xs text-muted-foreground">{entry.notes}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section
        data-room-detail-reveal
        className="rounded-2xl border border-dashed border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-4 text-center text-xs text-muted-foreground"
      >
        <Building2 className="mx-auto mb-2 size-4 text-[var(--nestora-sage)]" aria-hidden />
        Operational status ({room.operationalStatus}) is independent of bed occupancy — a room under maintenance may
        still show vacant beds until work completes.
      </section>

      <AdminRoomEditSheet
        room={room}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={async () => {
          if (onRoomUpdated) {
            await onRoomUpdated();
          }
        }}
      />

      <AdminRoomAssignSheet
        room={room}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssigned={async () => {
          if (onRoomUpdated) {
            await onRoomUpdated();
          }
        }}
      />
    </div>
  );
}
