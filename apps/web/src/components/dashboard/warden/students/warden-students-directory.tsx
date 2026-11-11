'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Eye, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { toast } from 'sonner';

import {
  formatJoinedDate,
  getStudentInitials,
  type StudentRecord,
  type StudentStatus,
} from '@/components/dashboard/students/admin-students-data';
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

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function StatusBadge({ status }: { status: StudentStatus }) {
  const styles: Record<StudentStatus, string> = {
    Active:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
    Pending:
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
    Inactive: 'border-border bg-muted/60 text-muted-foreground',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', styles[status])}>
      {status}
    </Badge>
  );
}

type Props = {
  rows: StudentRecord[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showVerificationActions: boolean;
  emptyHint: string;
};

export function WardenStudentsDirectory({
  rows,
  loading,
  error,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showVerificationActions,
  emptyHint,
}: Props) {
  const reduceMotion = useReducedMotion();
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !tableRef.current || loading) return;
      gsap.from(tableRef.current.querySelectorAll('[data-warden-student-row]'), {
        opacity: 0,
        x: -6,
        duration: 0.32,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: tableRef, dependencies: [reduceMotion, loading, rows.length, page] },
  );

  return (
    <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card shadow-sm">
      <div ref={tableRef} className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[12rem]">Student</TableHead>
              <TableHead>Reg. no.</TableHead>
              <TableHead className="hidden md:table-cell">Course</TableHead>
              <TableHead>Room &amp; bed</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 size-5 animate-spin" aria-hidden />
                  Loading students…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-sm font-medium text-foreground">No students match these filters.</p>
                  <p className="mt-1 text-xs text-muted-foreground">{emptyHint}</p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} data-warden-student-row>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--muted))] text-xs font-bold text-[var(--nestora-forest)]"
                        aria-hidden
                      >
                        {getStudentInitials(row.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{row.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{row.email}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.studentId}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{row.course}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                      <BedDouble className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                      {row.room === '—' ? 'Unallocated' : row.room}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatJoinedDate(row.joinedDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <motion.div className="inline-flex items-center justify-end gap-1">
                      <Button
                        nativeButton={false}
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        render={<Link href={`/warden/students/${row.id}`} aria-label={`View ${row.name}`} />}
                      >
                        <Eye className="size-4" aria-hidden />
                      </Button>
                      {showVerificationActions && row.status === 'Pending' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={cn('rounded-lg border-[var(--nestora-gold)]', focusRing)}
                          onClick={() =>
                            toast.message('Verification desk', {
                              description: `Open ${row.name} to complete tier-2 warden check (workflow wiring next).`,
                            })
                          }
                        >
                          <ShieldCheck className="size-4 text-[var(--nestora-gold)]" aria-hidden />
                          Verify
                        </Button>
                      ) : null}
                    </motion.div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence mode="wait">
        {!loading && rows.length > 0 ? (
          <motion.footer
            key="pager"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-4 py-3"
          >
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rows
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={cn('h-8 rounded-lg border border-border bg-background px-2', focusRing)}
              >
                {[10, 25, 50].map((n) => (
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
