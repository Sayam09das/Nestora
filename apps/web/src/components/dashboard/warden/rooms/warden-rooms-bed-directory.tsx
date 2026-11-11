'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Loader2 } from 'lucide-react';
import { useRef } from 'react';

import type { BedRecord, BedStatus } from '@/components/dashboard/beds/admin-beds-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
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

function StatusBadge({ status }: { status: BedStatus }) {
  const styles: Record<BedStatus, string> = {
    Available:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
    Occupied:
      'border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_8%,var(--card))]',
    Reserved:
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_15%,var(--card))]',
    Maintenance: 'border-border bg-muted/60 text-muted-foreground',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', styles[status])}>
      {status}
    </Badge>
  );
}

type Props = {
  beds: BedRecord[];
  loading: boolean;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
};

export function WardenRoomsBedDirectory({
  beds,
  loading,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const reduceMotion = useReducedMotion();
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !tableRef.current || loading) return;
      gsap.from(tableRef.current.querySelectorAll('[data-warden-bed-row]'), {
        opacity: 0,
        x: -6,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: tableRef, dependencies: [reduceMotion, loading, beds.length, page] },
  );

  return (
    <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card shadow-sm">
      <div ref={tableRef} className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Bed ID</TableHead>
              <TableHead>Room</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 size-5 animate-spin" aria-hidden />
                  Loading beds…
                </TableCell>
              </TableRow>
            ) : beds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No beds in this view.
                </TableCell>
              </TableRow>
            ) : (
              beds.map((bed) => (
                <TableRow key={bed.id} data-warden-bed-row>
                  <TableCell className="font-mono text-xs">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                      {bed.bedId}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{bed.roomNumber}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {bed.block} · {bed.floor}
                  </TableCell>
                  <TableCell className="text-sm">{bed.student?.name ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={bed.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AnimatePresence mode="wait">
        {!loading && beds.length > 0 ? (
          <motion.footer
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
          >
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rows
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={cn('h-8 rounded-lg border bg-background px-2', focusRing)}
              >
                {[12, 24, 48].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) onPageChange(page - 1);
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                    {page} / {totalPages}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) onPageChange(page + 1);
                    }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.footer>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
