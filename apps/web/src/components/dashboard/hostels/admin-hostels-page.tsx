'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminHostelsAddDrawer } from '@/components/dashboard/hostels/admin-hostels-add-drawer';
import { AdminHostelsDirectory } from '@/components/dashboard/hostels/admin-hostels-directory';
import { AdminHostelsFiltersBar } from '@/components/dashboard/hostels/admin-hostels-filters-bar';
import { AdminHostelsPageHeader } from '@/components/dashboard/hostels/admin-hostels-page-header';
import { AdminHostelsStatsStrip } from '@/components/dashboard/hostels/admin-hostels-stats-strip';
import {
  SAMPLE_HOSTELS,
  canDeleteHostel,
  matchesOccupancyFilter,
  type HostelRecord,
} from '@/components/dashboard/hostels/admin-hostels-data';
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

export function AdminHostelsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All Categories');
  const [campusFilter, setCampusFilter] = useState('All Campus Zones');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [occupancyFilter, setOccupancyFilter] = useState('All Occupancy');
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<HostelRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_HOSTELS.filter((row) => {
      if (genderFilter !== 'All Categories' && row.genderCategory !== genderFilter) return false;
      if (campusFilter !== 'All Campus Zones' && row.campusZone !== campusFilter) return false;
      if (statusFilter !== 'All Status' && row.status !== statusFilter) return false;
      if (!matchesOccupancyFilter(row, occupancyFilter)) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.hostelCode.toLowerCase().includes(q) ||
        row.address.toLowerCase().includes(q) ||
        row.wardenName.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [search, genderFilter, campusFilter, statusFilter, occupancyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const listKey = `${search}|${genderFilter}|${campusFilter}|${statusFilter}|${occupancyFilter}|${safePage}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-hostel-reveal]'), {
        opacity: 0,
        y: 14,
        stagger: 0.06,
        duration: 0.4,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  const reset = () => {
    setSearch('');
    setGenderFilter('All Categories');
    setCampusFilter('All Campus Zones');
    setStatusFilter('All Status');
    setOccupancyFilter('All Occupancy');
    setPage(1);
  };

  const handleDeleteRequest = (row: HostelRecord) => {
    setDeleteTarget(row);
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminHostelsPageHeader onAdd={() => setAddOpen(true)} />
      <AdminHostelsStatsStrip />
      <AdminHostelsFiltersBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        genderFilter={genderFilter}
        onGenderFilterChange={(v) => {
          setGenderFilter(v);
          setPage(1);
        }}
        campusFilter={campusFilter}
        onCampusFilterChange={(v) => {
          setCampusFilter(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        occupancyFilter={occupancyFilter}
        onOccupancyFilterChange={(v) => {
          setOccupancyFilter(v);
          setPage(1);
        }}
        onReset={reset}
      />
      <AdminHostelsDirectory
        pageRows={pageRows}
        filteredCount={filtered.length}
        onDelete={handleDeleteRequest}
        pageSize={pageSize}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        safePage={safePage}
        totalPages={totalPages}
        onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
        onPageNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        listKey={listKey}
      />
      <AdminHostelsAddDrawer open={addOpen} onOpenChange={setAddOpen} />
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget && canDeleteHostel(deleteTarget) ? 'Delete hostel?' : 'Deactivate instead?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && canDeleteHostel(deleteTarget)
                ? `${deleteTarget.name} has no linked rooms. This action is illustrative only in the sample UI.`
                : `${deleteTarget?.name} has ${deleteTarget?.totalRooms ?? 0} rooms and ${deleteTarget?.occupiedBeds ?? 0} occupied beds. Deactivate to block new room assignments while preserving history.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-[var(--nestora-forest)] text-white">
              {deleteTarget && canDeleteHostel(deleteTarget) ? 'Confirm delete' : 'Deactivate hostel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
