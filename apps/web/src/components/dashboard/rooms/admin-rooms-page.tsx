'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminRoomsDirectory } from '@/components/dashboard/rooms/admin-rooms-directory';
import { AdminRoomsFiltersBar } from '@/components/dashboard/rooms/admin-rooms-filters-bar';
import { AdminRoomsPageHeader } from '@/components/dashboard/rooms/admin-rooms-page-header';
import { AdminRoomsStatsStrip } from '@/components/dashboard/rooms/admin-rooms-stats-strip';
import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
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
import { useRoomsDirectory } from '@/hooks/use-rooms-directory';

export function AdminRoomsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [occupancyFilter, setOccupancyFilter] = useState('All Occupancy');
  const [pageSize, setPageSize] = useState<number>(6);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<RoomRecord | null>(null);

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelFilter,
      block: blockFilter,
      floor: floorFilter,
      roomType: roomTypeFilter,
      status: statusFilter,
      occupancy: occupancyFilter,
      page,
      pageSize,
    }),
    [search, hostelFilter, blockFilter, floorFilter, roomTypeFilter, statusFilter, occupancyFilter, page, pageSize],
  );

  const { summary, rooms, total, loadingSummary, loadingList, error, refresh } = useRoomsDirectory(filters);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = rooms;

  const facetOptions = useMemo(() => {
    const facets = summary?.facets;
    return {
      hostels: ['All Hostels', ...(facets?.hostels ?? [])] as const,
      blocks: ['All Blocks', ...(facets?.blocks ?? [])] as const,
      floors: ['All Floors', ...(facets?.floors ?? [])] as const,
      roomTypes: ['All Types', ...(facets?.roomTypes ?? [])] as const,
    };
  }, [summary?.facets]);

  const resetFilters = () => {
    setSearch('');
    setHostelFilter('All Hostels');
    setBlockFilter('All Blocks');
    setFloorFilter('All Floors');
    setRoomTypeFilter('All Types');
    setStatusFilter('All Status');
    setOccupancyFilter('All Occupancy');
    setPage(1);
  };

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) {
        return;
      }
      gsap.from(rootRef.current.querySelectorAll('[data-rooms-reveal]'), {
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
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <Button type="button" variant="link" className="h-auto p-0 text-destructive" onClick={() => refresh()}>
            Retry
          </Button>
        </p>
      ) : null}

      <AdminRoomsPageHeader summary={summary} loading={loadingSummary} />
      <AdminRoomsStatsStrip summary={summary} loading={loadingSummary} />

      <AdminRoomsFiltersBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        hostelFilter={hostelFilter}
        onHostelFilterChange={(value) => {
          setHostelFilter(value);
          setPage(1);
        }}
        blockFilter={blockFilter}
        onBlockFilterChange={(value) => {
          setBlockFilter(value);
          setPage(1);
        }}
        floorFilter={floorFilter}
        onFloorFilterChange={(value) => {
          setFloorFilter(value);
          setPage(1);
        }}
        roomTypeFilter={roomTypeFilter}
        onRoomTypeFilterChange={(value) => {
          setRoomTypeFilter(value);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        occupancyFilter={occupancyFilter}
        onOccupancyFilterChange={(value) => {
          setOccupancyFilter(value);
          setPage(1);
        }}
        onReset={resetFilters}
        filteredCount={total}
        hostelOptions={facetOptions.hostels}
        blockOptions={facetOptions.blocks}
        floorOptions={facetOptions.floors}
        roomTypeOptions={facetOptions.roomTypes}
      />

      {loadingList ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading rooms…
        </div>
      ) : (
        <AdminRoomsDirectory
          pageRows={pageRows}
          filteredCount={total}
          totalRooms={summary?.totalRooms ?? 0}
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
          listKey={`${safePage}-${pageSize}-${total}-${search}-${statusFilter}`}
        />
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete room record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes room <strong>{deleteTarget?.roomNumber}</strong> ({deleteTarget?.roomId}) from the directory.
              Assigned students must be moved first in production.
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
