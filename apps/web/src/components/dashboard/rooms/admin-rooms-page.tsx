'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminRoomsDirectory } from '@/components/dashboard/rooms/admin-rooms-directory';
import { AdminRoomsFiltersBar } from '@/components/dashboard/rooms/admin-rooms-filters-bar';
import { AdminRoomsPageHeader } from '@/components/dashboard/rooms/admin-rooms-page-header';
import { AdminRoomsStatsStrip } from '@/components/dashboard/rooms/admin-rooms-stats-strip';
import { SAMPLE_ROOMS, roomAvailableBeds, type RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
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

function matchesOccupancyFilter(room: RoomRecord, filter: string): boolean {
  const available = roomAvailableBeds(room);
  if (filter === 'All Occupancy') {
    return true;
  }
  if (filter === 'Has open beds') {
    return available > 0;
  }
  if (filter === 'Fully occupied') {
    return room.occupiedBeds >= room.capacity && room.capacity > 0;
  }
  if (filter === 'Vacant') {
    return room.occupiedBeds === 0;
  }
  return true;
}

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_ROOMS.filter((row) => {
      if (hostelFilter !== 'All Hostels' && row.hostel !== hostelFilter) {
        return false;
      }
      if (blockFilter !== 'All Blocks' && row.block !== blockFilter) {
        return false;
      }
      if (floorFilter !== 'All Floors' && row.floor !== floorFilter) {
        return false;
      }
      if (roomTypeFilter !== 'All Types' && row.roomType !== roomTypeFilter) {
        return false;
      }
      if (statusFilter !== 'All Status' && row.operationalStatus !== statusFilter) {
        return false;
      }
      if (!matchesOccupancyFilter(row, occupancyFilter)) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        row.roomNumber.toLowerCase().includes(q) ||
        row.roomId.toLowerCase().includes(q) ||
        row.hostel.toLowerCase().includes(q)
      );
    });
  }, [search, hostelFilter, blockFilter, floorFilter, roomTypeFilter, statusFilter, occupancyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

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
      <AdminRoomsPageHeader />
      <AdminRoomsStatsStrip />
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
        filteredCount={filtered.length}
      />
      <AdminRoomsDirectory
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
        listKey={`${safePage}-${pageSize}-${filtered.length}-${search}-${statusFilter}`}
      />
      <p className="text-center text-xs text-muted-foreground" role="note">
        Showing sample rooms · Illustrative UI data
      </p>
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
