'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminRoomTypesAddDrawer } from '@/components/dashboard/room-types/admin-room-types-add-drawer';
import { AdminRoomTypesDirectory } from '@/components/dashboard/room-types/admin-room-types-directory';
import { AdminRoomTypesFiltersBar } from '@/components/dashboard/room-types/admin-room-types-filters-bar';
import { AdminRoomTypesPageHeader } from '@/components/dashboard/room-types/admin-room-types-page-header';
import { AdminRoomTypesStatsStrip } from '@/components/dashboard/room-types/admin-room-types-stats-strip';
import type { RoomTypeRecord } from '@/components/dashboard/room-types/admin-room-types-data';
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
import { useRoomTypesDirectory } from '@/hooks/use-room-types-directory';

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

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelFilter,
      category: categoryFilter,
      capacity: capacityFilter,
      price: priceFilter,
      status: statusFilter,
      page,
      pageSize,
    }),
    [search, hostelFilter, categoryFilter, capacityFilter, priceFilter, statusFilter, page, pageSize],
  );

  const { summary, roomTypes, total, loadingSummary, loadingList, error, refresh } =
    useRoomTypesDirectory(filters);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = roomTypes;

  const facetOptions = useMemo(() => {
    const facets = summary?.facets;
    return {
      hostels: ['All Hostels', ...(facets?.hostels ?? [])] as const,
      categories: ['All Categories', ...(facets?.categories ?? [])] as const,
    };
  }, [summary?.facets]);

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
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <Button type="button" variant="link" className="h-auto p-0 text-destructive" onClick={() => refresh()}>
            Retry
          </Button>
        </p>
      ) : null}

      <AdminRoomTypesPageHeader summary={summary} loading={loadingSummary} onAdd={() => setAddOpen(true)} />
      <AdminRoomTypesStatsStrip summary={summary} loading={loadingSummary} />

      <AdminRoomTypesFiltersBar
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
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(v) => {
          setCategoryFilter(v);
          setPage(1);
        }}
        capacityFilter={capacityFilter}
        onCapacityFilterChange={(v) => {
          setCapacityFilter(v);
          setPage(1);
        }}
        priceFilter={priceFilter}
        onPriceFilterChange={(v) => {
          setPriceFilter(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        onReset={reset}
        filteredCount={total}
        hostelOptions={facetOptions.hostels}
        categoryOptions={facetOptions.categories}
      />

      {loadingList ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading room types…
        </div>
      ) : (
        <AdminRoomTypesDirectory
          pageRows={pageRows}
          filteredCount={total}
          onDelete={setDeleteTarget}
          pageSize={pageSize}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
          safePage={safePage}
          totalPages={totalPages}
          onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
          onPageNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          listKey={`${safePage}-${search}-${statusFilter}`}
        />
      )}

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
                  <strong>{deleteTarget.name}</strong> is used by {deleteTarget.totalRooms} rooms. Deactivate to block
                  new assignments while preserving historical configuration.
                </>
              ) : (
                <>
                  This removes <strong>{deleteTarget?.name}</strong> from the catalog.
                </>
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
