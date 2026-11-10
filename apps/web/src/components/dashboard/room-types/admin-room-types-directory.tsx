'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Eye, LayoutGrid, LayoutList, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import {
  formatInr,
  type RoomTypeRecord,
  type RoomTypeStatus,
} from '@/components/dashboard/room-types/admin-room-types-data';
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

function StatusBadge({ status }: { status: RoomTypeStatus }) {
  const tone =
    status === 'Active'
      ? 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]'
      : 'border-border bg-muted/60 text-muted-foreground';
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', tone)}>
      {status}
    </Badge>
  );
}

function TypeCard({ row }: { row: RoomTypeRecord }) {
  return (
    <article className="rt-grid-item flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[var(--nestora-forest)]">{row.name}</h3>
          <p className="text-xs text-muted-foreground">
            {row.typeCode} · {row.category}
          </p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {row.maxCapacity} Student{row.maxCapacity > 1 ? 's' : ''} · {row.bedCount} {row.bedConfiguration}
      </p>
      <p className="mt-4 text-xl font-semibold tabular-nums text-[var(--nestora-forest)]">
        {formatInr(row.monthlyPriceInr)}
        <span className="text-xs font-normal text-muted-foreground"> / month</span>
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{row.facilities.slice(0, 4).join(' · ')}</p>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--nestora-sage-muted)]/60 pt-4">
        <span className="text-xs tabular-nums text-muted-foreground">{row.totalRooms} rooms</span>
        <Button nativeButton={false} size="sm" variant="outline" className="h-8 rounded-lg text-xs" render={<Link href={`/admin/rooms/types/${row.id}`} />}>
          View details
        </Button>
      </div>
    </article>
  );
}

export type AdminRoomTypesDirectoryProps = {
  pageRows: RoomTypeRecord[];
  filteredCount: number;
  onDelete: (row: RoomTypeRecord) => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  safePage: number;
  totalPages: number;
  onPagePrev: () => void;
  onPageNext: () => void;
  listKey: string;
};

export function AdminRoomTypesDirectory(props: AdminRoomTypesDirectoryProps) {
  const { pageRows, filteredCount, onDelete, pageSize, onPageSizeChange, safePage, totalPages, onPagePrev, onPageNext, listKey } =
    props;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const reduceMotion = useReducedMotion();
  const bodyRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !bodyRef.current || !pageRows.length) return;
      const sel = viewMode === 'grid' ? '.rt-grid-item' : '[data-rt-row]';
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
    <section ref={sectionRef} data-rt-reveal className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Room type directory</h2>
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
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            {filteredCount} types
          </span>
        </div>
      </div>

      <div ref={bodyRef} className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {pageRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No room types match.</p>
          ) : viewMode === 'grid' ? (
            <ul key={`g-${listKey}`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pageRows.map((row) => (
                <li key={row.id}>
                  <TypeCard row={row} />
                </li>
              ))}
            </ul>
          ) : (
            <div key={`l-${listKey}`} className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room type</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Beds</TableHead>
                    <TableHead>Facilities</TableHead>
                    <TableHead>Rooms</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((row) => (
                    <TableRow key={row.id} data-rt-row>
                      <TableCell className="font-semibold">
                        <Link href={`/admin/rooms/types/${row.id}`} className="hover:underline">
                          {row.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.typeCode}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell className="tabular-nums">{row.maxCapacity}</TableCell>
                      <TableCell className="text-xs">{row.bedConfiguration}</TableCell>
                      <TableCell className="max-w-[8rem] truncate text-xs">{row.facilities.join(', ')}</TableCell>
                      <TableCell className="tabular-nums">{row.totalRooms}</TableCell>
                      <TableCell className="tabular-nums text-sm">{formatInr(row.monthlyPriceInr)}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn('inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted', focusRing)}>
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem render={<Link href={`/admin/rooms/types/${row.id}`} />}>
                              <Eye className="size-4" aria-hidden />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="size-4" aria-hidden />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(row)} disabled={row.totalRooms > 0}>
                              <Trash2 className="size-4" aria-hidden />
                              Delete…
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className={cn('h-8 rounded-lg border px-2 text-sm', focusRing)}>
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); onPagePrev(); }} className={cn(safePage <= 1 && 'pointer-events-none opacity-50')} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {safePage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); onPageNext(); }} className={cn(safePage >= totalPages && 'pointer-events-none opacity-50')} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
