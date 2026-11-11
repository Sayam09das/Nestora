'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  BedDouble,
  Building2,
  DoorOpen,
  Fan,
  RefreshCw,
  Shield,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  ROOM_REQUEST_OPTIONS,
  type RoomRequestType,
} from '@/components/dashboard/student-portal/room/student-room-data';
import { useStudentRoomLive } from '@/components/dashboard/student-portal/room/use-student-room-live';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  bath: Building2,
};

const requestStatusClass: Record<string, string> = {
  pending:
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_15%,var(--card))]',
  approved:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))]',
  rejected: 'border-border bg-muted/40 text-muted-foreground',
  in_progress:
    'border-[color-mix(in_oklch,var(--nestora-forest)_20%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_6%,var(--card))]',
};

function formatSyncTime(date: Date | null): string {
  if (!date) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function StudentRoomPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { displayName } = useStudentShell();
  const { snapshot, lastSyncedAt, isRefreshing, refresh, syncError } = useStudentRoomLive(displayName);

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState<RoomRequestType>('room_change');
  const [requestDescription, setRequestDescription] = useState('');

  const syncLabel = useMemo(() => formatSyncTime(lastSyncedAt), [lastSyncedAt]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-room-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, snapshot.allocationId] },
  );

  const submitRequest = () => {
    const trimmed = requestDescription.trim();
    if (trimmed.length < 8) {
      toast.error('Please describe your request in at least 8 characters.');
      return;
    }
    toast.success('Request submitted. Warden or admin will review — allocation cannot be changed directly.');
    setRequestOpen(false);
    setRequestDescription('');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
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

      <header data-student-room-block className="space-y-3">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: motionEase }}
          className="flex flex-wrap items-start justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--nestora-forest)]">My Room &amp; Bed</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              View your hostel allocation, room information, bed assignment, and roommate details. Changes to room or bed
              must be requested — they are not applied instantly.
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              aria-label="Refresh room allocation"
            >
              <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
            </button>
          </div>
        </motion.div>
      </header>

      <motion.section
        data-student-room-block
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: motionEase }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))]',
          'bg-[linear-gradient(120deg,color-mix(in_oklch,var(--nestora-forest)_92%,black)_0%,var(--nestora-forest)_55%,#0a3428_100%)] p-6 text-white shadow-md sm:p-8',
        )}
        aria-labelledby="current-allocation-heading"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-[color-mix(in_oklch,var(--nestora-gold)_25%,transparent)] blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.div className="flex flex-wrap items-center gap-2">
              <p id="current-allocation-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                Current Room Allocation
              </p>
              <Badge className="border-0 bg-[var(--nestora-gold)] font-bold text-[var(--nestora-forest)] hover:bg-[var(--nestora-gold)]">
                {snapshot.status}
              </Badge>
            </motion.div>
            <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">Room {snapshot.roomNumber}</p>
            <p className="mt-1 text-sm text-white/85">
              {snapshot.hostelName} · {snapshot.block} · {snapshot.floor}
            </p>
            <p className="mt-2 font-mono text-xs text-white/60">Allocation ID: {snapshot.allocationId}</p>
            {snapshot.illustrativeOnly ? (
              <p className="mt-2 text-[10px] uppercase tracking-wide text-white/45">Illustrative UI data only</p>
            ) : null}
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {[
              { label: 'Room Type', value: snapshot.roomType },
              { label: 'Bed Assigned', value: snapshot.bedAssigned },
              { label: 'Allocation Date', value: snapshot.allocationDate },
              { label: 'Academic Year', value: snapshot.academicYear },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-12">
        <motion.section
          data-student-room-block
          className="lg:col-span-7 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
          aria-labelledby="room-details-heading"
        >
          <h2 id="room-details-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Room details
          </h2>
          <dl className="mt-4 divide-y divide-border">
            {(
              [
                ['Hostel', snapshot.details.hostel],
                ['Block', snapshot.details.block],
                ['Floor', snapshot.details.floor],
                ['Room Number', snapshot.details.roomNumber],
                ['Room Type', snapshot.details.roomType],
                ['Total Capacity', `${snapshot.details.totalCapacity} Students`],
                ['Occupied Beds', String(snapshot.details.occupiedBeds)],
                ['Available Beds', String(snapshot.details.availableBeds)],
                ['Facilities', snapshot.details.facilitiesSummary],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium text-foreground sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.section>

        <motion.section
          data-student-room-block
          className="lg:col-span-5 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_5%,var(--card))] p-5 shadow-sm sm:p-6"
          aria-labelledby="bed-assignment-heading"
        >
          <div className="flex items-start justify-between gap-2">
            <h2 id="bed-assignment-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Your Assigned Bed
            </h2>
            <Badge variant="outline" className="font-semibold capitalize text-[var(--nestora-forest)]">
              Occupied by You
            </Badge>
          </div>
          <motion.div className="mt-4 flex items-center gap-4 rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_30%,var(--border))] bg-card p-4">
            <span className="flex size-14 items-center justify-center rounded-xl bg-[var(--nestora-forest)] text-white">
              <BedDouble className="size-7" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-bold text-[var(--nestora-forest)]">{snapshot.bed.label}</p>
              <p className="text-sm text-muted-foreground">
                Room {snapshot.roomNumber} · {snapshot.block}
              </p>
            </div>
          </motion.div>
          <dl className="mt-4 space-y-2 text-sm">
            <motion.div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Bed status</dt>
              <dd className="font-semibold text-[var(--nestora-forest)]">{snapshot.bed.status}</dd>
            </motion.div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Bed allocation date</dt>
              <dd className="font-medium">{snapshot.bed.allocationDate}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            You cannot change bed allocation directly. Submit a bed change request for warden review.
          </p>
        </motion.section>
      </div>

      <motion.section
        data-student-room-block
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="roommates-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="roommates-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Roommates
          </h2>
          <Badge variant="outline" className="font-semibold tabular-nums">
            {snapshot.details.occupiedBeds} / {snapshot.details.totalCapacity} Occupied
          </Badge>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {snapshot.roommates.map((mate, index) => (
            <motion.li
              key={mate.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3, ease: motionEase }}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4',
                mate.isYou
                  ? 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_8%,var(--card))]'
                  : 'border-border bg-muted/15',
              )}
            >
              <span
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  mate.isYou ? 'bg-[var(--nestora-forest)] text-white' : 'bg-muted text-[var(--nestora-forest)]',
                )}
                aria-hidden
              >
                {mate.initials}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{mate.name}</p>
                <p className="text-xs text-muted-foreground">
                  {mate.bedLabel}
                  {mate.isYou ? ' · You' : ` · ${mate.program}`}
                </p>
              </div>
              {mate.isYou ? (
                <Badge className="ml-auto shrink-0 border-0 bg-[var(--nestora-forest)] text-white hover:bg-[var(--nestora-forest)]">
                  You
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-auto shrink-0 text-[10px] font-semibold uppercase">
                  Roommate
                </Badge>
              )}
            </motion.li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Contact details for roommates are not shown for privacy.</p>
      </motion.section>

      <motion.section
        data-student-room-block
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="facilities-heading"
      >
        <h2 id="facilities-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
          Room facilities
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {snapshot.facilities
            .filter((f) => f.available)
            .map((facility) => {
              const Icon = facilityIcons[facility.id] ?? Wrench;
              return (
                <li key={facility.id}>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs font-medium text-foreground">
                    <Icon className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                    {facility.label}
                  </span>
                </li>
              );
            })}
          {snapshot.facilities
            .filter((f) => !f.available)
            .map((facility) => (
              <li key={facility.id}>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground line-through">
                  {facility.label}
                </span>
              </li>
            ))}
        </ul>
      </motion.section>

      <motion.section
        data-student-room-block
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="requests-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <motion.div>
            <h2 id="requests-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Room-related requests
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Maintenance uses a separate workflow — use the Maintenance portal for urgent repairs.
            </p>
          </motion.div>
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 bg-[var(--nestora-forest)] px-3 text-xs font-semibold text-white hover:bg-[color-mix(in_oklch,var(--nestora-forest)_88%,black)]',
              focusRing,
            )}
          >
            Submit New Request
          </button>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ROOM_REQUEST_OPTIONS.map((opt) => (
            <li key={opt.type}>
              {opt.href ? (
                <Link
                  href={opt.href}
                  className={cn(
                    'flex h-full flex-col rounded-xl border border-border bg-muted/15 p-3 transition hover:border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] hover:bg-muted/25',
                    focusRing,
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{opt.description}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setRequestType(opt.type);
                    setRequestOpen(true);
                  }}
                  className={cn(
                    'flex h-full w-full flex-col rounded-xl border border-border bg-muted/15 p-3 text-left transition hover:bg-muted/25',
                    focusRing,
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{opt.description}</span>
                </button>
              )}
            </li>
          ))}
        </ul>

        <form action={undefined} onSubmit={(e) => e.preventDefault()} className="mt-6 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.requests.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell className="text-sm font-medium">{row.typeLabel}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.submittedAt}</TableCell>
                  <TableCell className="hidden max-w-[14rem] truncate text-sm text-muted-foreground md:table-cell">
                    {row.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px] font-bold uppercase', requestStatusClass[row.status])}>
                      {row.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      className={cn('text-xs font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}
                      onClick={() => toast.info(`${row.id}: ${row.description}`)}
                    >
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </form>
      </motion.section>

      <motion.section
        data-student-room-block
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="history-heading"
      >
        <h2 id="history-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
          Allocation history
        </h2>
        <form action={undefined} onSubmit={(e) => e.preventDefault()} className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Year</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Bed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.allocationHistory.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.academicYear}</TableCell>
                  <TableCell>{row.hostel}</TableCell>
                  <TableCell className="tabular-nums">{row.room}</TableCell>
                  <TableCell>{row.bed}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-semibold',
                        row.status === 'Current'
                          ? 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] text-[var(--nestora-forest)]'
                          : 'text-muted-foreground',
                      )}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </form>
      </motion.section>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit room-related request</DialogTitle>
            <DialogDescription>
              Requests are reviewed by the warden or hostel admin. Your current allocation stays active until approved.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            action={undefined}
            onSubmit={(e) => {
              e.preventDefault();
              submitRequest();
            }}
          >
            <div>
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="request-type">
                Request type
              </label>
              <select
                id="request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as RoomRequestType)}
                className={cn('mt-1 w-full border border-border bg-background px-3 py-2 text-sm', focusRing)}
              >
                {ROOM_REQUEST_OPTIONS.filter((o) => !o.href).map((o) => (
                  <option key={o.type} value={o.type}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="request-desc">
                Description
              </label>
              <textarea
                id="request-desc"
                rows={3}
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder="Explain why you need this change…"
                className={cn('mt-1 w-full resize-y border border-border bg-background px-3 py-2 text-sm', focusRing)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose
                className={cn(
                  'inline-flex h-9 items-center border border-border px-3 text-xs font-medium hover:bg-muted',
                  focusRing,
                )}
              >
                Cancel
              </DialogClose>
              <button
                type="submit"
                className={cn('inline-flex h-9 items-center bg-[var(--nestora-forest)] px-4 text-xs font-semibold text-white', focusRing)}
              >
                Submit request
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
