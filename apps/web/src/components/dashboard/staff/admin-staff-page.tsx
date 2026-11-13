'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminStaffDirectory } from '@/components/dashboard/staff/admin-staff-directory';
import { AdminStaffFiltersBar } from '@/components/dashboard/staff/admin-staff-filters-bar';
import { AdminStaffPageHeader } from '@/components/dashboard/staff/admin-staff-page-header';
import { AdminStaffStatsStrip } from '@/components/dashboard/staff/admin-staff-stats-strip';
import type { StaffRecord } from '@/components/dashboard/staff/admin-staff-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useStaffDirectory } from '@/hooks/use-staff-directory';

type AdminStaffPageProps = {
  pageVariant?: 'all' | 'wardens';
};

export function AdminStaffPage({ pageVariant = 'all' }: AdminStaffPageProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  const defaultRoleFilter = 'All Roles';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState(defaultRoleFilter);
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<StaffRecord | null>(null);

  const filters = useMemo(
    () => ({
      q: search,
      status: statusFilter,
      role: roleFilter,
      department: departmentFilter,
      hostel: locationFilter,
      page,
      pageSize,
      variant: pageVariant,
    }),
    [search, statusFilter, roleFilter, departmentFilter, locationFilter, page, pageSize, pageVariant],
  );

  const { summary, staff, total, loadingSummary, loadingList, error, refresh } = useStaffDirectory(filters);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = staff;
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  const facetOptions = useMemo(() => {
    const facets = summary?.facets;
    return {
      roles: ['All Roles', ...(facets?.roles ?? [])] as const,
      departments: ['All Departments', ...(facets?.departments ?? [])] as const,
      locations: ['All Locations', ...(facets?.hostels ?? [])] as const,
    };
  }, [summary?.facets]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All Status');
    setRoleFilter(defaultRoleFilter);
    setDepartmentFilter('All Departments');
    setLocationFilter('All Locations');
    setPage(1);
  };

  const toggleAllOnPage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const row of pageRows) {
        if (checked) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      }
      return next;
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) {
        return;
      }
      gsap.from(rootRef.current.querySelectorAll('[data-staff-reveal]'), {
        opacity: 0,
        y: 14,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  const headerProps =
    pageVariant === 'wardens'
      ? {
          title: 'Wardens',
          subtitle:
            'Hostel wardens assigned to each residence — roster status, contact details, and location at a glance.',
        }
      : {};

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <Button type="button" variant="link" className="h-auto p-0 text-destructive" onClick={() => refresh()}>
            Retry
          </Button>
        </p>
      ) : null}

      <AdminStaffPageHeader {...headerProps} summary={summary} loading={loadingSummary} />

      <AdminStaffStatsStrip summary={summary} loading={loadingSummary} />

      <AdminStaffFiltersBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(value) => {
          setRoleFilter(value);
          setPage(1);
        }}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={(value) => {
          setDepartmentFilter(value);
          setPage(1);
        }}
        locationFilter={locationFilter}
        onLocationFilterChange={(value) => {
          setLocationFilter(value);
          setPage(1);
        }}
        onReset={resetFilters}
        filteredCount={total}
        roleOptions={facetOptions.roles}
        departmentOptions={facetOptions.departments}
        locationOptions={facetOptions.locations}
      />

      {loadingList ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading staff directory…
        </p>
      ) : null}

      <AdminStaffDirectory
        pageRows={pageRows}
        filteredCount={total}
        selected={selected}
        allPageSelected={allPageSelected}
        onToggleAllOnPage={toggleAllOnPage}
        onToggleRow={toggleRow}
        onDelete={setDeleteTarget}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        safePage={safePage}
        totalPages={totalPages}
        onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
        onPageNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        listKey={`${safePage}-${pageSize}-${total}-${search}-${statusFilter}-${pageVariant}`}
      />

      <p className="text-center text-xs text-muted-foreground" role="note">
        Live directory — refreshes every 20 seconds and when you return to this tab.
      </p>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from directory?</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivating <strong>{deleteTarget?.name}</strong> ({deleteTarget?.staffId}) is not wired yet. Open the
              profile to edit assignments and account status instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
