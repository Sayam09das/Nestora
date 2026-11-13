'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Download,
  Eye,
  LayoutList,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  formatStaffJoinedDate,
  STAFF_DIRECTORY_STATS,
  type StaffRecord,
  type StaffStatus,
} from '@/components/dashboard/staff/admin-staff-data';
import { StaffDirectoryAvatar } from '@/components/dashboard/staff/staff-directory-avatar';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
const PAGE_SIZE_OPTIONS = [5, 10, 25] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function StatusBadge({ status }: { status: StaffStatus }) {
  const styles: Record<StaffStatus, string> = {
    Active:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
    'On Leave':
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
    Inactive: 'border-border bg-muted/60 text-muted-foreground',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', styles[status])}>
      {status}
    </Badge>
  );
}

function StaffRowActions({
  row,
  onDelete,
  compact,
}: {
  row: StaffRecord;
  onDelete: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn('inline-flex items-center gap-1', compact && 'scale-95')}>
      {!compact ? (
        <Button
          nativeButton={false}
          size="sm"
          variant="ghost"
          className="rounded-lg"
          render={<Link href={`/admin/staff/${row.id}`} aria-label={`View ${row.name}`} />}
        >
          <Eye className="size-4" aria-hidden />
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted',
            focusRing,
          )}
          aria-label={`More actions for ${row.name}`}
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem render={<Link href={`/admin/staff/${row.id}`} />}>
            <Eye className="size-4" aria-hidden />
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/admin/staff/${row.id}/edit`} />}>
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
    </div>
  );
}

export type AdminStaffDirectoryProps = {
  pageRows: StaffRecord[];
  filteredCount: number;
  selected: Set<string>;
  allPageSelected: boolean;
  onToggleAllOnPage: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onDelete: (row: StaffRecord) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  safePage: number;
  totalPages: number;
  onPagePrev: () => void;
  onPageNext: () => void;
  listKey: string;
};

export function AdminStaffDirectory({
  pageRows,
  filteredCount,
  selected,
  allPageSelected,
  onToggleAllOnPage,
  onToggleRow,
  onDelete,
  pageSize,
  onPageSizeChange,
  safePage,
  totalPages,
  onPagePrev,
  onPageNext,
  listKey,
}: AdminStaffDirectoryProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelector('[data-staff-dir-shell]'), {
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
      const rows = bodyRef.current.querySelectorAll('[data-staff-dir-row]');
      gsap.from(rows, {
        opacity: 0,
        y: 8,
        duration: 0.28,
        stagger: 0.03,
        ease: 'power1.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: bodyRef, dependencies: [listKey, pageRows.length, reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      data-staff-reveal
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-[0_1px_0_0_color-mix(in_oklch,var(--nestora-sage-muted)_40%,transparent),0_20px_48px_-40px_color-mix(in_srgb,var(--nestora-forest)_22%,transparent)]"
      aria-labelledby="staff-directory-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--nestora-sage)_10%,transparent),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[color-mix(in_oklch,var(--nestora-forest)_45%,var(--nestora-sage))]"
        aria-hidden
      />

      <div data-staff-dir-shell className="relative border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] shadow-sm">
              <LayoutList className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Roster</p>
              <h2 id="staff-directory-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
                Staff directory
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-semibold tabular-nums text-foreground">{pageRows.length}</span> of{' '}
                <span className="font-semibold tabular-nums text-foreground">{filteredCount}</span> filtered ·{' '}
                <span className="font-semibold tabular-nums text-foreground">
                  {STAFF_DIRECTORY_STATS.total.toLocaleString('en-IN')}
                </span>{' '}
                total
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))] bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Page {safePage} / {totalPages}
            </span>
            {selected.size > 0 ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))] px-2.5 py-1 text-[10px] font-semibold text-[var(--nestora-forest)]">
                {selected.size} selected
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selected.size > 0 ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: motionEase }}
            className="overflow-hidden border-b border-[var(--nestora-gold)]/35 bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
              <p className="text-sm font-semibold text-[var(--nestora-forest)]">Bulk actions</p>
              <motion.div
                className="flex flex-wrap gap-2"
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: motionEase }}
              >
                <Button type="button" size="sm" variant="outline" className="rounded-xl bg-card/80 shadow-sm">
                  <UserCheck className="size-3.5" aria-hidden />
                  Activate
                </Button>
                <Button type="button" size="sm" variant="outline" className="rounded-xl bg-card/80 shadow-sm">
                  <UserX className="size-3.5" aria-hidden />
                  Deactivate
                </Button>
                <Button type="button" size="sm" variant="outline" className="rounded-xl bg-card/80 shadow-sm">
                  <Download className="size-3.5" aria-hidden />
                  Export selected
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div ref={bodyRef}>
        {pageRows.length === 0 ? (
          <div className="px-4 py-14 text-center sm:px-5">
            <p className="text-sm font-medium text-[var(--nestora-forest)]">No staff match these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try resetting filters or broadening your search.</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[var(--nestora-sage-muted)]/80 bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))] hover:bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
                      <TableHead className="sticky left-0 z-[1] w-10 bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
                        <Checkbox
                          checked={allPageSelected}
                          onCheckedChange={(v) => onToggleAllOnPage(v === true)}
                          aria-label="Select all staff on this page"
                        />
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Staff
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Contact
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Department
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Location
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Joined
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((row) => {
                      const isSelected = selected.has(row.id);
                      return (
                        <TableRow
                          key={row.id}
                          data-staff-dir-row
                          className={cn(
                            'border-[var(--nestora-sage-muted)]/60 transition-colors duration-150',
                            'hover:bg-[color-mix(in_oklch,var(--nestora-sage)_6%,var(--card))]',
                            isSelected &&
                              'bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))] hover:bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))]',
                          )}
                        >
                          <TableCell className="sticky left-0 z-[1] bg-inherit">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(v) => onToggleRow(row.id, v === true)}
                              aria-label={`Select ${row.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-3">
                              <motion.span
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))] text-xs font-bold text-[var(--nestora-forest)] shadow-sm"
                                whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                              >
                                <StaffDirectoryAvatar name={row.name} photoUrl={row.profilePhotoUrl} size="sm" />
                              </motion.span>
                              <span className="min-w-0">
                                <span className="block font-semibold text-foreground">{row.name}</span>
                                <span className="block text-xs text-muted-foreground">{row.staffId}</span>
                              </span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="block text-sm">{row.email}</span>
                            <span className="block text-xs text-muted-foreground">{row.phone}</span>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{row.role}</TableCell>
                          <TableCell className="text-sm">{row.department}</TableCell>
                          <TableCell className="text-sm">{row.hostel}</TableCell>
                          <TableCell>
                            <StatusBadge status={row.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatStaffJoinedDate(row.joinedDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <StaffRowActions row={row} onDelete={() => onDelete(row)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <ul className="divide-y divide-[var(--nestora-sage-muted)]/60 lg:hidden">
              {pageRows.map((row) => {
                const isSelected = selected.has(row.id);
                return (
                  <motion.li
                    key={row.id}
                    data-staff-dir-row
                    layout={!reduceMotion}
                    className={cn(
                      'px-4 py-3 transition-colors',
                      isSelected && 'bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))]',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(v) => onToggleRow(row.id, v === true)}
                        aria-label={`Select ${row.name}`}
                      />
                      <StaffDirectoryAvatar
                        name={row.name}
                        photoUrl={row.profilePhotoUrl}
                        size="md"
                        className="bg-muted/40"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{row.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {row.staffId} · {row.email}
                            </p>
                          </div>
                          <StatusBadge status={row.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.role} · {row.department} · {row.hostel}
                        </p>
                        <motion.div className="mt-2 flex gap-2" whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
                          <Button
                            nativeButton={false}
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            render={<Link href={`/admin/staff/${row.id}`} />}
                          >
                            View
                          </Button>
                          <StaffRowActions row={row} onDelete={() => onDelete(row)} compact />
                        </motion.div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_10%,var(--card))] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <motion.div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <label htmlFor="staff-page-size" className="sr-only">
            Rows per page
          </label>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Rows</span>
          <select
            id="staff-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              'h-9 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-2.5 text-sm shadow-sm',
              focusRing,
            )}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </motion.div>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPagePrev();
                }}
                className={cn('rounded-xl', safePage <= 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()} className="rounded-xl">
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
                className={cn('rounded-xl', safePage >= totalPages && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
