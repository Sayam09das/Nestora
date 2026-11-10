'use client';

import { LayoutList } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { formatAllocationDate, type AllocationRecord, type AllocationStatus } from '@/components/dashboard/allocation/admin-allocation-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function StatusBadge({ status }: { status: AllocationStatus }) {
  const tone =
    status === 'Allocated'
      ? 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] text-[var(--nestora-forest)]'
      : status === 'Rejected'
        ? 'border-destructive/30 text-destructive'
        : 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))]';
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', tone)}>
      {status}
    </Badge>
  );
}

export type AdminAllocationDirectoryProps = {
  pageRows: AllocationRecord[];
  filteredCount: number;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  safePage: number;
  totalPages: number;
  onPagePrev: () => void;
  onPageNext: () => void;
  listKey: string;
};

export function AdminAllocationDirectory(props: AdminAllocationDirectoryProps) {
  const { pageRows, filteredCount, pageSize, onPageSizeChange, safePage, totalPages, onPagePrev, onPageNext, listKey } = props;
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!bodyRef.current || !pageRows.length) return;
      gsap.from(bodyRef.current.querySelectorAll('[data-alloc-row]'), {
        opacity: 0,
        y: 10,
        stagger: 0.03,
        duration: 0.35,
        clearProps: 'opacity,transform',
      });
    },
    { scope: bodyRef, dependencies: [listKey, pageRows.length] },
  );

  return (
    <section data-alloc-reveal className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
          <LayoutList className="size-4" aria-hidden />
          Allocation registry
        </h2>
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">{filteredCount} records</span>
      </div>
      <div ref={bodyRef} className="overflow-x-auto p-4 sm:p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Hostel / Room</TableHead>
              <TableHead>Bed</TableHead>
              <TableHead>Allocated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow key={row.id} data-alloc-row>
                <TableCell className="font-mono text-xs">{row.allocationRef}</TableCell>
                <TableCell>
                  <span className="font-medium">{row.studentName}</span>
                  <p className="text-xs text-muted-foreground">{row.studentId}</p>
                </TableCell>
                <TableCell className="text-sm">{row.type}</TableCell>
                <TableCell className="text-sm">
                  {row.hostel ?? '—'}
                  {row.roomNumber ? ` · ${row.roomNumber}` : ''}
                </TableCell>
                <TableCell className="font-mono text-xs">{row.bedId ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.allocatedAt ? formatAllocationDate(row.allocatedAt) : '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button nativeButton={false} size="sm" variant="outline" className="h-8 rounded-lg text-xs" render={<Link href={`/admin/allocation/${row.id}`} className={focusRing} />}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pageRows.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No allocation records match filters.</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--nestora-sage-muted)]/70 px-4 py-3 sm:px-5">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn('h-8 rounded-lg border px-2 text-xs', focusRing)}
          >
            {[6, 8, 10].map((n) => (
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
