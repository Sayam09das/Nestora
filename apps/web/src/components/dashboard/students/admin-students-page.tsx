'use client';

import { useReducedMotion } from 'framer-motion';
import { AdminStudentsDirectory } from '@/components/dashboard/students/admin-students-directory';
import { AdminStudentsPageHeader } from '@/components/dashboard/students/admin-students-page-header';
import { AdminStudentsFiltersBar } from '@/components/dashboard/students/admin-students-filters-bar';
import { AdminStudentsStatsStrip } from '@/components/dashboard/students/admin-students-stats-strip';
import { useMemo, useRef, useState } from 'react';

import {
  SAMPLE_STUDENTS,
  type StudentRecord,
} from '@/components/dashboard/students/admin-students-data';
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
export function AdminStudentsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [pageSize, setPageSize] = useState<number>(5);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_STUDENTS.filter((row) => {
      if (statusFilter !== 'All Status' && row.status !== statusFilter) {
        return false;
      }
      if (hostelFilter !== 'All Hostels' && row.hostel !== hostelFilter) {
        return false;
      }
      if (courseFilter !== 'All Courses' && row.course !== courseFilter) {
        return false;
      }
      if (yearFilter !== 'All Years' && row.academicYear !== yearFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        row.name.toLowerCase().includes(q) ||
        row.studentId.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, hostelFilter, courseFilter, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All Status');
    setHostelFilter('All Hostels');
    setCourseFilter('All Courses');
    setYearFilter('All Years');
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
      gsap.from(rootRef.current.querySelectorAll('[data-students-reveal]'), {
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

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminStudentsPageHeader />

      <AdminStudentsStatsStrip />

      <AdminStudentsFiltersBar
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
        hostelFilter={hostelFilter}
        onHostelFilterChange={(value) => {
          setHostelFilter(value);
          setPage(1);
        }}
        courseFilter={courseFilter}
        onCourseFilterChange={(value) => {
          setCourseFilter(value);
          setPage(1);
        }}
        yearFilter={yearFilter}
        onYearFilterChange={(value) => {
          setYearFilter(value);
          setPage(1);
        }}
        onReset={resetFilters}
        filteredCount={filtered.length}
      />

      <AdminStudentsDirectory
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
        UI concept with illustrative student data. Connect Nestora APIs to replace placeholders.
      </p>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>{deleteTarget?.name}</strong> ({deleteTarget?.studentId}) from the directory. This
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
