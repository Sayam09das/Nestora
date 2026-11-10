'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminStaffDirectory } from '@/components/dashboard/staff/admin-staff-directory';
import { AdminStaffFiltersBar } from '@/components/dashboard/staff/admin-staff-filters-bar';
import { AdminStaffPageHeader } from '@/components/dashboard/staff/admin-staff-page-header';
import { AdminStaffStatsStrip } from '@/components/dashboard/staff/admin-staff-stats-strip';
import { SAMPLE_STAFF, type StaffRecord } from '@/components/dashboard/staff/admin-staff-data';
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
  const [pageSize, setPageSize] = useState<number>(5);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<StaffRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_STAFF.filter((row) => {
      if (pageVariant === 'wardens' && !row.role.toLowerCase().includes('warden')) {
        return false;
      }
      if (statusFilter !== 'All Status' && row.status !== statusFilter) {
        return false;
      }
      if (roleFilter !== 'All Roles' && row.role !== roleFilter) {
        return false;
      }
      if (departmentFilter !== 'All Departments' && row.department !== departmentFilter) {
        return false;
      }
      if (locationFilter !== 'All Locations' && row.hostel !== locationFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        row.name.toLowerCase().includes(q) ||
        row.staffId.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, roleFilter, departmentFilter, locationFilter, pageVariant]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

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
      <AdminStaffPageHeader {...headerProps} />

      <AdminStaffStatsStrip />

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
        filteredCount={filtered.length}
      />

      <AdminStaffDirectory
        pageRows={pageRows}
        filteredCount={filtered.length}
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
        listKey={`${safePage}-${pageSize}-${filtered.length}-${search}`}
      />

      <p className="text-center text-xs text-muted-foreground" role="note">
        UI concept with illustrative staff data. Connect Nestora APIs to replace placeholders.
      </p>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete staff record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>{deleteTarget?.name}</strong> ({deleteTarget?.staffId}) from the directory. This
              action cannot be undone in production — confirm only for sample UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
              onClick={() => setDeleteTarget(null)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
