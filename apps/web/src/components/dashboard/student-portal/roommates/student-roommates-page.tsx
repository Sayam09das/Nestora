'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeftRight,
  BedDouble,
  Building2,
  DoorOpen,
  Fan,
  RefreshCw,
  ShieldAlert,
  Users,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { StudentRoommateDetailSheet } from '@/components/dashboard/student-portal/roommates/student-roommate-detail-sheet';
import type { StudentRoommateCard } from '@/components/dashboard/student-portal/roommates/student-roommates-data';
import { useStudentRoommatesLive } from '@/components/dashboard/student-portal/roommates/use-student-roommates-live';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const facilityIcons: Record<string, LucideIcon> = {
  wifi: Wifi,
  fan: Fan,
  bed: BedDouble,
  desk: Building2,
  wardrobe: DoorOpen,
};

function formatSyncTime(date: Date | null): string {
  if (!date) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function RoommateProfileCard({
  mate,
  index,
  reduceMotion,
  onSelect,
}: {
  mate: StudentRoommateCard;
  index: number;
  reduceMotion: boolean | null;
  onSelect: (mate: StudentRoommateCard) => void;
}) {
  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.38, ease: motionEase }}
    >
      <button
        type="button"
        onClick={() => onSelect(mate)}
        className={cn(
          'group flex w-full flex-col gap-4 rounded-2xl border p-5 text-left shadow-sm transition',
          'hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:shadow-md',
          mate.isYou
            ? 'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_6%,var(--card))]'
            : 'border-border bg-card',
          focusRing,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'flex size-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold transition group-hover:scale-[1.02]',
              mate.isYou ? 'bg-[var(--nestora-forest)] text-white' : 'bg-muted text-[var(--nestora-forest)]',
            )}
            aria-hidden
          >
            {mate.initials}
          </span>
          <Badge
            variant={mate.isYou ? 'default' : 'outline'}
            className={cn(
              'shrink-0 font-semibold uppercase tracking-wide',
              mate.isYou && 'border-0 bg-[var(--nestora-forest)] hover:bg-[var(--nestora-forest)]',
            )}
          >
            {mate.isYou ? 'You' : 'Roommate'}
          </Badge>
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--nestora-forest)]">{mate.name}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{mate.registrationNumber}</p>
        </div>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-2 border-t border-border pt-3">
            <dt className="text-xs font-semibold text-muted-foreground">Bed assignment</dt>
            <dd className="font-semibold text-foreground">{mate.bedLabel}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-xs font-semibold text-muted-foreground">Course</dt>
            <dd className="text-right font-medium text-foreground">{mate.courseLine}</dd>
          </div>
        </dl>
        <span className="text-xs font-medium text-[var(--nestora-sage)] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          View profile details →
        </span>
      </button>
    </motion.li>
  );
}

export function StudentRoommatesPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { displayName } = useStudentShell();
  const { snapshot, lastSyncedAt, isRefreshing, refresh, syncError } = useStudentRoommatesLive(displayName);

  const [selected, setSelected] = useState<StudentRoommateCard | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const syncLabel = useMemo(() => formatSyncTime(lastSyncedAt), [lastSyncedAt]);

  const openDetail = (mate: StudentRoommateCard) => {
    setSelected(mate);
    setSheetOpen(true);
  };

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-roommates-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
      });
    },
    { scope: rootRef, dependencies: [snapshot.hasAllocation], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="space-y-8 pb-10">
      {syncError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span>{syncError}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            className={cn('rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold', focusRing)}
          >
            Retry
          </button>
        </div>
      ) : null}

      <header data-roommates-block className="flex flex-wrap items-start justify-between gap-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: motionEase }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--nestora-forest)]">My Roommates</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            View your roommates, their basic profiles, and shared room information. Profiles show only what your
            institution allows — no chat, contact details, or social feeds.
          </p>
          <motion.div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card px-3 py-1.5 text-xs font-medium text-[var(--nestora-forest)]"
              role="status"
              aria-live="polite"
            >
              <span
                className={cn(
                  'size-2 rounded-full bg-[var(--nestora-sage)]',
                  !reduceMotion && !isRefreshing && 'animate-pulse',
                )}
                aria-hidden
              />
              Live · {syncLabel}
            </span>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className={cn(
                'inline-flex size-9 items-center justify-center border border-border bg-card transition hover:bg-muted disabled:opacity-60',
                focusRing,
              )}
              aria-label="Refresh roommate list"
            >
              <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
            </button>
          </motion.div>
        </motion.div>
        <Link
          href="/student/room"
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))]',
            'bg-[var(--nestora-forest)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95',
            focusRing,
          )}
        >
          <BedDouble className="size-4" aria-hidden />
          View My Room
        </Link>
      </header>

      <motion.section
        data-roommates-block
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: motionEase }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))]',
          'bg-[linear-gradient(125deg,color-mix(in_oklch,var(--nestora-forest)_88%,black)_0%,var(--nestora-forest)_50%,#0a3428_100%)] p-6 text-white shadow-md sm:p-8',
        )}
        aria-labelledby="shared-room-heading"
      >
        <div className="pointer-events-none absolute -left-16 top-0 size-48 rounded-full bg-[color-mix(in_oklch,var(--nestora-gold)_22%,transparent)] blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Your shared room</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 id="shared-room-heading" className="text-lg font-semibold">
                {snapshot.hasAllocation ? `Room ${snapshot.roomNumber}` : 'No room assigned'}
              </h2>
              {snapshot.hasAllocation ? (
                <Badge className="border-0 bg-[var(--nestora-gold)] font-bold text-[var(--nestora-forest)] hover:bg-[var(--nestora-gold)]">
                  {snapshot.roomStatus}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-white/85">
              {snapshot.hasAllocation
                ? `${snapshot.hostelName} · ${snapshot.block} · ${snapshot.floor}`
                : 'Request a room allocation from the warden to see roommate details.'}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Room capacity', value: String(snapshot.capacity).padStart(2, '0') },
              { label: 'Occupants', value: String(snapshot.occupants).padStart(2, '0') },
              { label: 'Available beds', value: String(snapshot.availableBeds).padStart(2, '0') },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{item.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.section>

      <motion.section
        data-roommates-block
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="profiles-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="profiles-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <Users className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            Roommate profiles
          </h2>
          {snapshot.roommates.length > 0 ? (
            <span className="text-xs text-muted-foreground">{snapshot.roommates.length} resident(s) in this room</span>
          ) : null}
        </div>

        {snapshot.roommates.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            No roommates to display yet. When you have an active bed allocation, your roommates will appear here
            automatically.
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {snapshot.roommates.map((mate, index) => (
              <RoommateProfileCard
                key={mate.id}
                mate={mate}
                index={index}
                reduceMotion={reduceMotion}
                onSelect={openDetail}
              />
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Avatars use initials only. Official student photos and personal contact details are withheld per privacy
          policy.
        </p>
      </motion.section>

      <StudentRoommateDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        roommate={selected?.detail ?? null}
      />

      <motion.section
        data-roommates-block
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: motionEase }}
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="facilities-heading"
      >
        <h2 id="facilities-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
          Shared room facilities
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {snapshot.facilities.map((facility) => {
            const Icon = facilityIcons[facility.id] ?? Fan;
            return (
              <li
                key={facility.id}
                className="flex items-center gap-3 rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_4%,var(--card))] px-4 py-3"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-card text-[var(--nestora-sage)] shadow-sm">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-foreground">{facility.label}</span>
              </li>
            );
          })}
        </ul>
      </motion.section>

      <motion.section
        data-roommates-block
        className="grid gap-4 sm:grid-cols-2"
        aria-labelledby="actions-heading"
      >
        <h2 id="actions-heading" className="sr-only">
          Roommate-related actions
        </h2>
        <Link
          href="/student/complaints?category=roommate"
          className={cn(
            'group flex flex-col gap-2 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_30%,var(--border))]',
            'bg-[color-mix(in_oklch,var(--nestora-gold)_6%,var(--card))] p-5 shadow-sm transition hover:shadow-md',
            focusRing,
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--nestora-gold)_20%,var(--card))] text-[var(--nestora-forest)]">
            <ShieldAlert className="size-5" aria-hidden />
          </span>
          <span className="text-base font-semibold text-[var(--nestora-forest)]">Report a roommate issue</span>
          <span className="text-sm text-muted-foreground">
            Submit a confidential concern to the warden. Your report is handled through the complaints workflow.
          </span>
        </Link>
        <Link
          href="/student/room"
          className={cn(
            'group flex flex-col gap-2 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm transition hover:shadow-md',
            focusRing,
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--card))] text-[var(--nestora-forest)]">
            <ArrowLeftRight className="size-5" aria-hidden />
          </span>
          <span className="text-base font-semibold text-[var(--nestora-forest)]">Request room change</span>
          <span className="text-sm text-muted-foreground">
            Submit a request for a different room allocation from My Room &amp; Bed.
          </span>
        </Link>
      </motion.section>
    </div>
  );
}
