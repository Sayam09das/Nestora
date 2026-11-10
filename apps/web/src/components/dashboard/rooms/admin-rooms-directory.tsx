'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Eye,
  Hammer,
  LayoutGrid,
  LayoutList,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import {
  roomAvailableBeds,
  roomOccupancyPercent,
  type RoomOperationalStatus,
  type RoomRecord,
} from '@/components/dashboard/rooms/admin-rooms-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
const PAGE_SIZE_OPTIONS = [6, 8, 12] as const;
const BAR_GREEN = '#6d9773';
const BAR_GOLD = '#ffba00';
const BAR_TRACK = '#e7e7dc';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type ViewMode = 'grid' | 'list';

function StatusBadge({ status }: { status: RoomOperationalStatus }) {
  const styles: Record<RoomOperationalStatus, string> = {
    Available:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
    Full:
      'border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_8%,var(--card))] text-[var(--nestora-forest)]',
    Maintenance:
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
    Inactive: 'border-border bg-muted/60 text-muted-foreground',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', styles[status])}>
      {status}
    </Badge>
  );
}

function OccupancyBar({ room }: { room: RoomRecord }) {
  const pct = roomOccupancyPercent(room);
  const filled = room.operationalStatus === 'Maintenance' ? BAR_GOLD : BAR_GREEN;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>Occupancy</span>
        <span className="tabular-nums text-foreground">
          {room.occupiedBeds}/{room.capacity}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: BAR_TRACK }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: filled }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: motionEase }}
        />
      </div>
    </div>
  );
}

function RoomActionsMenu({ room, onDelete }: { room: RoomRecord; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted',
          focusRing,
        )}
        aria-label={`More actions for room ${room.roomNumber}`}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem render={<Link href={`/admin/rooms/${room.id}`} />}>
          <Eye className="size-4" aria-hidden />
          View room details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil className="size-4" aria-hidden />
          Edit room
        </DropdownMenuItem>
        <DropdownMenuItem disabled={room.operationalStatus === 'Maintenance' || room.operationalStatus === 'Inactive'}>
          <UserPlus className="size-4" aria-hidden />
          Assign student
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/admin/rooms/${room.id}#residents`} />}>
          <Users className="size-4" aria-hidden />
          View assigned students
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ToggleLeft className="size-4" aria-hidden />
          Change room status
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Hammer className="size-4" aria-hidden />
          Mark for maintenance
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" aria-hidden />
          Delete room…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BedsAvailableLabel({ room }: { room: RoomRecord }) {
  const available = roomAvailableBeds(room);
  const suffix = available === 1 ? 'bed' : 'beds';
  const notAssignable = room.operationalStatus === 'Maintenance' || room.operationalStatus === 'Inactive';
  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-semibold tabular-nums text-[var(--nestora-forest)]">{available}</span> {suffix} available
      {notAssignable ? (
        <span className="text-[var(--nestora-gold)]"> · not assignable ({room.operationalStatus.toLowerCase()})</span>
      ) : null}
    </p>
  );
}

function RoomGridCard({ room, onDelete }: { room: RoomRecord; onDelete: () => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      data-rooms-dir-card
      layout={!reduceMotion}
      className={cn(
        'rooms-grid-item flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm',
        'transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_oklch,var(--nestora-sage)_38%,var(--border))] hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight text-[var(--nestora-forest)]">{room.roomNumber}</p>
          <StatusBadge status={room.operationalStatus} />
        </div>
        <RoomActionsMenu room={room} onDelete={onDelete} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {room.hostel} · {room.floor} · {room.roomType}
      </p>
      <div className="mt-4 flex-1">
        <OccupancyBar room={room} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--nestora-sage-muted)]/70 pt-3">
        <BedsAvailableLabel room={room} />
        <Button
          nativeButton={false}
          size="sm"
          variant="outline"
          className="h-8 rounded-lg border-[var(--nestora-sage-muted)] text-xs font-semibold"
          render={<Link href={`/admin/rooms/${room.id}`} />}
        >
          View details
        </Button>
      </div>
    </motion.article>
  );
}

export type AdminRoomsDirectoryProps = {
  pageRows: RoomRecord[];
  filteredCount: number;
  totalRooms: number;
  onDelete: (row: RoomRecord) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  safePage: number;
  totalPages: number;
  onPagePrev: () => void;
  onPageNext: () => void;
  listKey: string;
};

export function AdminRoomsDirectory({
  pageRows,
  filteredCount,
  totalRooms,
  onDelete,
  pageSize,
  onPageSizeChange,
  safePage,
  totalPages,
  onPagePrev,
  onPageNext,
  listKey,
}: AdminRoomsDirectoryProps) {
  const reduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelector('[data-rooms-dir-shell]'), {
        opacity: 0,
        y: 12,
        duration: 0.42,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  useGSAP(
    () => {
      if (reduceMotion || !bodyRef.current || pageRows.length === 0) {
        return;
      }
      const selector = viewMode === 'grid' ? '.rooms-grid-item' : '[data-rooms-dir-row]';
      gsap.from(bodyRef.current.querySelectorAll(selector), {
        opacity: 0,
        scale: viewMode === 'grid' ? 0.96 : 1,
        y: viewMode === 'grid' ? 16 : 8,
        duration: viewMode === 'grid' ? 0.4 : 0.28,
        stagger: viewMode === 'grid' ? { each: 0.06, from: 'start', grid: 'auto' } : 0.03,
        ease: viewMode === 'grid' ? 'back.out(1.2)' : 'power1.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: bodyRef, dependencies: [listKey, pageRows.length, reduceMotion, viewMode] },
  );

  return (
    <section
      ref={sectionRef}
      data-rooms-reveal
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-[0_1px_0_0_color-mix(in_oklch,var(--nestora-sage-muted)_40%,transparent),0_20px_48px_-40px_color-mix(in_srgb,var(--nestora-forest)_22%,transparent)]"
      aria-labelledby="rooms-directory-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--nestora-sage)_10%,transparent),transparent)]"
        aria-hidden
      />

      <div data-rooms-dir-shell className="relative border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] shadow-sm">
              <LayoutGrid className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Directory</p>
              <h2 id="rooms-directory-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
                Room directory
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-semibold tabular-nums text-foreground">{pageRows.length}</span> of{' '}
                <span className="font-semibold tabular-nums text-foreground">{filteredCount}</span> filtered ·{' '}
                <span className="font-semibold tabular-nums text-foreground">
                  {totalRooms.toLocaleString('en-IN')}
                </span>{' '}
                total
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-0.5"
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors',
                  viewMode === 'grid'
                    ? 'bg-[var(--nestora-forest)] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  focusRing,
                )}
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid className="size-3.5" aria-hidden />
                Grid
              </button>
              <button
                type="button"
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors',
                  viewMode === 'list'
                    ? 'bg-[var(--nestora-forest)] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  focusRing,
                )}
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
              >
                <LayoutList className="size-3.5" aria-hidden />
                List
              </button>
            </div>
            <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))] bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Page {safePage} / {totalPages}
            </span>
          </div>
        </div>
      </div>

      <div ref={bodyRef} className="relative p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {pageRows.length === 0 ? (
            <motion.p
              key="empty"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              className="py-12 text-center text-sm text-muted-foreground"
            >
              No rooms match these filters. Try resetting or broadening your search.
            </motion.p>
          ) : viewMode === 'grid' ? (
            <motion.ul
              key={`grid-${listKey}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {pageRows.map((room) => (
                <li key={room.id}>
                  <RoomGridCard room={room} onDelete={() => onDelete(room)} />
                </li>
              ))}
            </motion.ul>
          ) : (
            <motion.div
              key={`list-${listKey}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              className="overflow-x-auto rounded-xl border border-[var(--nestora-sage-muted)]/80"
            >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Room</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((room) => (
                    <TableRow key={room.id} data-rooms-dir-row>
                      <TableCell className="font-semibold text-[var(--nestora-forest)]">
                        <Link href={`/admin/rooms/${room.id}`} className={cn('hover:underline', focusRing)}>
                          {room.roomNumber}
                        </Link>
                        <p className="text-[11px] font-normal text-muted-foreground">{room.roomId}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {room.hostel}
                        <p className="text-xs text-muted-foreground">
                          {room.block} · {room.floor}
                        </p>
                      </TableCell>
                      <TableCell>{room.roomType}</TableCell>
                      <TableCell className="tabular-nums">{room.capacity}</TableCell>
                      <TableCell className="tabular-nums">{room.occupiedBeds}</TableCell>
                      <TableCell className="tabular-nums">{roomAvailableBeds(room)}</TableCell>
                      <TableCell>
                        <StatusBadge status={room.operationalStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            nativeButton={false}
                            size="sm"
                            variant="ghost"
                            className="rounded-lg"
                            render={<Link href={`/admin/rooms/${room.id}`} aria-label={`View ${room.roomNumber}`} />}
                          >
                            <Eye className="size-4" aria-hidden />
                          </Button>
                          <RoomActionsMenu room={room} onDelete={() => onDelete(room)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              'h-8 rounded-lg border border-[var(--nestora-sage-muted)] bg-card px-2 text-sm text-foreground',
              focusRing,
            )}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPagePrev();
                }}
                className={cn(safePage <= 1 && 'pointer-events-none opacity-50', focusRing)}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive className="rounded-lg">
                {safePage}
              </PaginationLink>
            </PaginationItem>
            {totalPages > 2 ? (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageNext();
                }}
                className={cn(safePage >= totalPages && 'pointer-events-none opacity-50', focusRing)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
