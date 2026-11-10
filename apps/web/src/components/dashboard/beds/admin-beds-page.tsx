'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminBedsAddDrawer } from '@/components/dashboard/beds/admin-beds-add-drawer';
import { AdminBedsDirectory } from '@/components/dashboard/beds/admin-beds-directory';
import { AdminBedsFiltersBar } from '@/components/dashboard/beds/admin-beds-filters-bar';
import { AdminBedsPageHeader } from '@/components/dashboard/beds/admin-beds-page-header';
import { AdminBedsStatsStrip } from '@/components/dashboard/beds/admin-beds-stats-strip';
import { SAMPLE_BEDS, type BedRecord } from '@/components/dashboard/beds/admin-beds-data';
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

export function AdminBedsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BedRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_BEDS.filter((row) => {
      if (hostelFilter !== 'All Hostels' && row.hostel !== hostelFilter) return false;
      if (blockFilter !== 'All Blocks' && row.block !== blockFilter) return false;
      if (floorFilter !== 'All Floors' && row.floor !== floorFilter) return false;
      if (roomFilter !== 'All Rooms' && row.roomNumber !== roomFilter) return false;
      if (statusFilter !== 'All Status' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.bedId.toLowerCase().includes(q) ||
        row.roomNumber.toLowerCase().includes(q) ||
        row.student?.name.toLowerCase().includes(q) ||
        row.student?.studentId.toLowerCase().includes(q)
      );
    });
  }, [search, hostelFilter, blockFilter, floorFilter, roomFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetFilters = () => {
    setSearch('');
    setHostelFilter('All Hostels');
    setBlockFilter('All Blocks');
    setFloorFilter('All Floors');
    setRoomFilter('All Rooms');
    setStatusFilter('All Status');
    setPage(1);
  };

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-beds-reveal]'), {
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
      <AdminBedsPageHeader onAddBed={() => setAddOpen(true)} />
      <AdminBedsStatsStrip />
      <AdminBedsFiltersBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        hostelFilter={hostelFilter}
        onHostelFilterChange={(v) => {
          setHostelFilter(v);
          setPage(1);
        }}
        blockFilter={blockFilter}
        onBlockFilterChange={(v) => {
          setBlockFilter(v);
          setPage(1);
        }}
        floorFilter={floorFilter}
        onFloorFilterChange={(v) => {
          setFloorFilter(v);
          setPage(1);
        }}
        roomFilter={roomFilter}
        onRoomFilterChange={(v) => {
          setRoomFilter(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        onReset={resetFilters}
        filteredCount={filtered.length}
      />
      <AdminBedsDirectory
        pageRows={pageRows}
        filteredCount={filtered.length}
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
        Showing illustrative bed records · Visual UI concept with sample inventory data
      </p>

      <AdminBedsAddDrawer open={addOpen} onOpenChange={setAddOpen} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bed record?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes <strong>{deleteTarget?.bedId}</strong> from inventory. A bed cannot be deleted while occupied in
              production.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-destructive text-white" onClick={() => setDeleteTarget(null)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
