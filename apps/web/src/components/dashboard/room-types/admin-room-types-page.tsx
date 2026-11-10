'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminRoomTypesAddDrawer } from '@/components/dashboard/room-types/admin-room-types-add-drawer';
import { AdminRoomTypesDirectory } from '@/components/dashboard/room-types/admin-room-types-directory';
import { AdminRoomTypesFiltersBar } from '@/components/dashboard/room-types/admin-room-types-filters-bar';
import { AdminRoomTypesPageHeader } from '@/components/dashboard/room-types/admin-room-types-page-header';
import { AdminRoomTypesStatsStrip } from '@/components/dashboard/room-types/admin-room-types-stats-strip';
import {
  SAMPLE_ROOM_TYPES,
  matchesCapacityFilter,
  matchesHostelFilter,
  matchesPriceFilter,
  type RoomTypeRecord,
} from '@/components/dashboard/room-types/admin-room-types-data';
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

export function AdminRoomTypesPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [capacityFilter, setCapacityFilter] = useState('All Capacity');
  const [priceFilter, setPriceFilter] = useState('All Pricing');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<RoomTypeRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_ROOM_TYPES.filter((row) => {
      if (!matchesHostelFilter(row, hostelFilter)) return false;
      if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
      if (!matchesCapacityFilter(row.maxCapacity, capacityFilter)) return false;
      if (!matchesPriceFilter(row.monthlyPriceInr, priceFilter)) return false;
      if (statusFilter !== 'All Status' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.typeCode.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [search, hostelFilter, categoryFilter, capacityFilter, priceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-rt-reveal]'), {
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
    setHostelFilter('All Hostels');
    setCategoryFilter('All Categories');
    setCapacityFilter('All Capacity');
    setPriceFilter('All Pricing');
    setStatusFilter('All Status');
    setPage(1);
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminRoomTypesPageHeader onAdd={() => setAddOpen(true)} />
      <AdminRoomTypesStatsStrip />
      <AdminRoomTypesFiltersBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        hostelFilter={hostelFilter}
        onHostelFilterChange={(v) => { setHostelFilter(v); setPage(1); }}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(v) => { setCategoryFilter(v); setPage(1); }}
        capacityFilter={capacityFilter}
        onCapacityFilterChange={(v) => { setCapacityFilter(v); setPage(1); }}
        priceFilter={priceFilter}
        onPriceFilterChange={(v) => { setPriceFilter(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1); }}
        onReset={reset}
        filteredCount={filtered.length}
      />
      <AdminRoomTypesDirectory
        pageRows={pageRows}
        filteredCount={filtered.length}
        onDelete={setDeleteTarget}
        pageSize={pageSize}
        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        safePage={safePage}
        totalPages={totalPages}
        onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
        onPageNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        listKey={`${safePage}-${search}-${statusFilter}`}
      />
      <p className="text-center text-xs text-muted-foreground" role="note">
        Illustrative room types and pricing for UI demonstration.
      </p>
      <AdminRoomTypesAddDrawer open={addOpen} onOpenChange={setAddOpen} />
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget && deleteTarget.totalRooms > 0 ? 'Deactivate instead of delete?' : 'Delete room type?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.totalRooms > 0 ? (
                <>
                  <strong>{deleteTarget.name}</strong> is used by {deleteTarget.totalRooms} rooms. Deactivate to block new
                  assignments while preserving historical configuration.
                </>
              ) : (
                <>This removes <strong>{deleteTarget?.name}</strong> from the catalog (sample UI).</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={() => setDeleteTarget(null)}>
              {deleteTarget && deleteTarget.totalRooms > 0 ? 'Deactivate' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
