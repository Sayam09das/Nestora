'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Eye, LayoutGrid, LayoutList, MoreHorizontal, Pencil, ToggleLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import {
  BED_STATUS_HINTS,
  type BedRecord,
  type BedStatus,
} from '@/components/dashboard/beds/admin-beds-data';
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

const PAGE_SIZE_OPTIONS = [6, 8, 12] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type ViewMode = 'grid' | 'list';

function StatusBadge({ status }: { status: BedStatus }) {
  const styles: Record<BedStatus, string> = {
    Available:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
    Occupied:
      'border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_8%,var(--card))] text-[var(--nestora-forest)]',
    Reserved:
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
    Maintenance:
      'border-[color-mix(in_oklch,var(--nestora-gold)_30%,var(--border))] bg-muted/50 text-[var(--nestora-forest)]',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', styles[status])} title={BED_STATUS_HINTS[status]}>
      {status}
    </Badge>
  );
}

function BedActions({ bed, onDelete }: { bed: BedRecord; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn('inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted', focusRing)}
        aria-label={`Actions for ${bed.bedId}`}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem render={<Link href={`/admin/rooms/beds/${bed.id}`} />}>
          <Eye className="size-4" aria-hidden />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil className="size-4" aria-hidden />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ToggleLeft className="size-4" aria-hidden />
          Change status
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" aria-hidden />
          Delete…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BedGridCard({ bed, onDelete }: { bed: BedRecord; onDelete: () => void }) {
  return (
    <article
      data-beds-dir-card
      className={cn(
        'beds-grid-item flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm',
        'hover:border-[color-mix(in_oklch,var(--nestora-sage)_38%,var(--border))] hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold text-[var(--nestora-forest)]">{bed.bedId}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {bed.hostel} · Room {bed.roomNumber}
          </p>
          <motion.div layout={false} className="mt-2">
            <StatusBadge status={bed.status} />
          </motion.div>
        </div>
        <BedActions bed={bed} onDelete={onDelete} />
      </div>

      <motion.div
        className="mt-4 flex-1 space-y-2 rounded-xl border border-[var(--nestora-sage-muted)]/60 bg-[color-mix(in_oklch,var(--nestora-cream)_10%,var(--card))] p-3"
        whileHover={undefined}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Student</p>
        {bed.student ? (
          <>
            <p className="text-sm font-semibold text-foreground">{bed.student.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{bed.student.studentId}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
        <p className="text-[11px] text-muted-foreground">{bed.bedType}</p>
        {bed.roomUnderMaintenance ? (
          <p className="text-[11px] font-medium text-[var(--nestora-gold)]">Room maintenance — not assignable</p>
        ) : null}
      </motion.div>

      <div className="mt-4 flex justify-end">
        <Button
          nativeButton={false}
          size="sm"
          variant="outline"
          className="h-8 rounded-lg text-xs font-semibold"
          render={<Link href={`/admin/rooms/beds/${bed.id}`} />}
        >
          View details
        </Button>
      </div>
    </article>
  );
}

export type AdminBedsDirectoryProps = {
  pageRows: BedRecord[];
  filteredCount: number;
  totalBeds: number;
  onDelete: (row: BedRecord) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  safePage: number;
  totalPages: number;
  onPagePrev: () => void;
  onPageNext: () => void;
  listKey: string;
};

export function AdminBedsDirectory(props: AdminBedsDirectoryProps) {
  const {
    pageRows,
    filteredCount,
    totalBeds,
    onDelete,
    pageSize,
    onPageSizeChange,
    safePage,
    totalPages,
    onPagePrev,
    onPageNext,
    listKey,
  } = props;

  const reduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelector('[data-beds-dir-shell]'), {
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
      if (reduceMotion || !bodyRef.current || pageRows.length === 0) return;
      const selector = viewMode === 'grid' ? '.beds-grid-item' : '[data-beds-dir-row]';
      gsap.from(bodyRef.current.querySelectorAll(selector), {
        opacity: 0,
        y: viewMode === 'grid' ? 14 : 8,
        scale: viewMode === 'grid' ? 0.96 : 1,
        duration: 0.35,
        stagger: viewMode === 'grid' ? { each: 0.06, from: 'start', grid: 'auto' } : 0.03,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: bodyRef, dependencies: [listKey, pageRows.length, reduceMotion, viewMode] },
  );

  return (
    <section
      ref={sectionRef}
      data-beds-reveal
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-[0_20px_48px_-40px_color-mix(in_srgb,var(--nestora-forest)_22%,transparent)]"
      aria-labelledby="beds-directory-heading"
    >
      <div data-beds-dir-shell className="border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Individual beds</p>
            <h2 id="beds-directory-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Bed directory
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {pageRows.length} of {filteredCount} filtered · {totalBeds.toLocaleString('en-IN')} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-[var(--nestora-sage-muted)] p-0.5" role="group" aria-label="View mode">
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold capitalize',
                    viewMode === mode ? 'bg-[var(--nestora-forest)] text-white' : 'text-muted-foreground',
                    focusRing,
                  )}
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                >
                  {mode === 'grid' ? <LayoutGrid className="size-3.5" aria-hidden /> : <LayoutList className="size-3.5" aria-hidden />}
                  {mode}
                </button>
              ))}
            </div>
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
              Page {safePage}/{totalPages}
            </span>
          </div>
        </div>
      </div>

      <div ref={bodyRef} className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {pageRows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No beds match these filters.</p>
          ) : viewMode === 'grid' ? (
            <ul key={`grid-${listKey}`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pageRows.map((bed) => (
                <li key={bed.id}>
                  <BedGridCard bed={bed} onDelete={() => onDelete(bed)} />
                </li>
              ))}
            </ul>
          ) : (
            <div key={`list-${listKey}`} className="overflow-x-auto rounded-xl border border-[var(--nestora-sage-muted)]/80">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Bed ID</TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Bed #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((bed) => (
                    <TableRow key={bed.id} data-beds-dir-row>
                      <TableCell className="font-mono text-xs font-semibold">
                        <Link href={`/admin/rooms/beds/${bed.id}`} className={cn('hover:underline', focusRing)}>
                          {bed.bedId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{bed.hostel}</TableCell>
                      <TableCell className="tabular-nums">{bed.roomNumber}</TableCell>
                      <TableCell>{bed.bedLabel}</TableCell>
                      <TableCell className="text-sm">
                        {bed.student ? (
                          <>
                            {bed.student.name}
                            <p className="font-mono text-[11px] text-muted-foreground">{bed.student.studentId}</p>
                          </>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{bed.bedType}</TableCell>
                      <TableCell>
                        <StatusBadge status={bed.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <BedActions bed={bed} onDelete={() => onDelete(bed)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn('h-8 rounded-lg border px-2 text-sm', focusRing)}
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
                className={cn(safePage <= 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
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
                className={cn(safePage >= totalPages && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
