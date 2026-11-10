'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Eye, LayoutGrid, LayoutList, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import {
  hostelOccupancyPct,
  type HostelRecord,
  type HostelStatus,
} from '@/components/dashboard/hostels/admin-hostels-data';
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

type ViewMode = 'grid' | 'list';
const PAGE_SIZES = [4, 6, 8] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function StatusBadge({ status }: { status: HostelStatus }) {
  const tone =
    status === 'Active'
      ? 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]'
      : status === 'Under Setup'
        ? 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] text-[var(--nestora-forest)]'
        : 'border-border bg-muted/60 text-muted-foreground';
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', tone)}>
      {status}
    </Badge>
  );
}

function HostelCard({ row }: { row: HostelRecord }) {
  const pct = hostelOccupancyPct(row);
  return (
    <article className="hostel-grid-item flex h-full flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm hover:shadow-md">
      <div className="relative h-24 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-sage)_25%,var(--card)),color-mix(in_oklch,var(--nestora-forest)_12%,var(--card)))]">
        <motion.div
          className="absolute inset-0 opacity-30"
          aria-hidden
          initial={false}
          style={{
            backgroundImage:
              'repeating-linear-gradient(-12deg,transparent,transparent 8px,color-mix(in oklch,var(--nestora-forest) 8%,transparent) 8px,color-mix(in oklch,var(--nestora-forest) 8%,transparent) 9px)',
          }}
        />
        <motion.div
          className="absolute bottom-2 left-3 h-12 w-[4.5rem] rounded-md border border-white/20 bg-[color-mix(in_oklch,var(--nestora-cream)_30%,white)] shadow-sm"
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          aria-hidden
        >
          <div className="grid h-full grid-cols-3 gap-px p-1">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="rounded-[2px] bg-[color-mix(in_oklch,var(--nestora-sage)_45%,white)]" />
            ))}
          </div>
        </motion.div>
        <div className="absolute right-3 top-3">
          <StatusBadge status={row.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-[var(--nestora-forest)]">{row.name}</h3>
        <p className="text-xs text-muted-foreground">
          {row.hostelCode} · {row.genderCategory}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{row.campusZone}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span>{row.totalBuildings} buildings</span>
          <span aria-hidden>·</span>
          <span>{row.totalRooms} rooms</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{row.totalBeds} beds</span>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Occupancy</span>
            <span className="font-semibold tabular-nums text-foreground">{row.totalBeds ? `${pct}%` : '—'}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e7e7dc]">
            <div
              className="h-full rounded-full bg-[#6d9773] transition-[width] duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Warden: {row.wardenName}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--nestora-sage-muted)]/60 pt-4">
          <span className="text-xs text-muted-foreground line-clamp-1">{row.facilities[0] ?? 'No facilities listed'}</span>
          <Button nativeButton={false} size="sm" variant="outline" className="h-8 rounded-lg text-xs" render={<Link href={`/admin/hostels/${row.id}`} />}>
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}

export type AdminHostelsDirectoryProps = {
  pageRows: HostelRecord[];
  filteredCount: number;
  onDelete: (row: HostelRecord) => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  safePage: number;
  totalPages: number;
  onPagePrev: () => void;
  onPageNext: () => void;
  listKey: string;
};

export function AdminHostelsDirectory(props: AdminHostelsDirectoryProps) {
  const { pageRows, filteredCount, onDelete, pageSize, onPageSizeChange, safePage, totalPages, onPagePrev, onPageNext, listKey } =
    props;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const reduceMotion = useReducedMotion();
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !bodyRef.current || !pageRows.length) return;
      const sel = viewMode === 'grid' ? '.hostel-grid-item' : '[data-hostel-row]';
      gsap.from(bodyRef.current.querySelectorAll(sel), {
        opacity: 0,
        y: 12,
        stagger: viewMode === 'grid' ? { each: 0.06, grid: 'auto' } : 0.03,
        duration: 0.35,
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: bodyRef, dependencies: [listKey, viewMode, pageRows.length, reduceMotion] },
  );

  return (
    <section data-hostel-reveal className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Hostel directory</h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border p-0.5" role="group" aria-label="View mode">
            {(['grid', 'list'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={viewMode === m}
                onClick={() => setViewMode(m)}
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold capitalize',
                  viewMode === m ? 'bg-[var(--nestora-forest)] text-white' : 'text-muted-foreground',
                  focusRing,
                )}
              >
                {m === 'grid' ? <LayoutGrid className="size-3.5" /> : <LayoutList className="size-3.5" />}
                {m}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{filteredCount} hostels</span>
        </div>
      </div>
      <div ref={bodyRef} className="p-4 sm:p-5">
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.ul
              key="grid"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {pageRows.map((row) => (
                <li key={row.id}>
                  <HostelCard row={row} />
                </li>
              ))}
            </motion.ul>
          ) : (
            <motion.div key="list" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hostel</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Buildings</TableHead>
                    <TableHead>Rooms</TableHead>
                    <TableHead>Beds</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Warden</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((row) => {
                    const pct = hostelOccupancyPct(row);
                    const canDelete = row.totalRooms === 0 && row.occupiedBeds === 0;
                    return (
                      <TableRow key={row.id} data-hostel-row>
                        <TableCell className="font-medium text-[var(--nestora-forest)]">{row.name}</TableCell>
                        <TableCell className="font-mono text-xs">{row.hostelCode}</TableCell>
                        <TableCell className="text-sm">{row.genderCategory}</TableCell>
                        <TableCell className="text-sm">{row.campusZone}</TableCell>
                        <TableCell className="tabular-nums">{row.totalBuildings}</TableCell>
                        <TableCell className="tabular-nums">{row.totalRooms}</TableCell>
                        <TableCell className="tabular-nums">{row.totalBeds}</TableCell>
                        <TableCell className="tabular-nums">{row.totalBeds ? `${pct}%` : '—'}</TableCell>
                        <TableCell className="max-w-[8rem] truncate text-sm">{row.wardenName}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button type="button" variant="ghost" size="icon-sm" className={cn('rounded-lg', focusRing)} aria-label={`Actions for ${row.name}`} />
                              }
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem render={<Link href={`/admin/hostels/${row.id}`} />}>
                                <Eye className="size-4" aria-hidden />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="size-4" aria-hidden />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant={canDelete ? 'destructive' : 'default'}
                                disabled={!canDelete}
                                onClick={() => onDelete(row)}
                              >
                                <Trash2 className="size-4" aria-hidden />
                                {canDelete ? 'Delete' : 'Deactivate (rooms linked)'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
        {pageRows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No hostels match the current filters.</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--nestora-sage-muted)]/70 px-4 py-3 sm:px-5">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn('h-8 rounded-lg border px-2 text-xs', focusRing)}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); onPagePrev(); }} className={safePage <= 1 ? 'pointer-events-none opacity-50' : ''} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                {safePage} / {totalPages}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); onPageNext(); }} className={safePage >= totalPages ? 'pointer-events-none opacity-50' : ''} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
