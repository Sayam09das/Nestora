'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightLeft, BedDouble, LayoutGrid } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import type { AllocationRecord } from '@/components/dashboard/allocation/admin-allocation-data';
import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { WardenRoomsAllocateSheet } from '@/components/dashboard/warden/rooms/warden-rooms-allocate-sheet';
import { WardenRoomsBedDirectory } from '@/components/dashboard/warden/rooms/warden-rooms-bed-directory';
import { WardenRoomsFilters } from '@/components/dashboard/warden/rooms/warden-rooms-filters';
import { WardenRoomsFloorHeatmap } from '@/components/dashboard/warden/rooms/warden-rooms-floor-heatmap';
import { WardenRoomsHeader } from '@/components/dashboard/warden/rooms/warden-rooms-header';
import { WardenRoomsMatrix } from '@/components/dashboard/warden/rooms/warden-rooms-matrix';
import { WardenRoomsRequests } from '@/components/dashboard/warden/rooms/warden-rooms-requests';
import { WardenRoomsRoomSheet } from '@/components/dashboard/warden/rooms/warden-rooms-room-sheet';
import { WardenRoomsStatsStrip } from '@/components/dashboard/warden/rooms/warden-rooms-stats-strip';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Button } from '@/components/ui/button';
import { useAllocationsDirectory } from '@/hooks/use-allocations-directory';
import { useBedsDirectory } from '@/hooks/use-beds-directory';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { useRoomsDirectory } from '@/hooks/use-rooms-directory';
import { useWardenHostelInventoryStats } from '@/hooks/use-warden-hostel-inventory-stats';
import { cn } from '@/lib/utils';

type DeskTab = 'matrix' | 'beds' | 'requests';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenRoomsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { selectedHostelId } = useWardenShell();
  const { overview, refresh: refreshOverview } = useOperationalDashboardOverview('HOSTEL_WARDEN');
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames);
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames);

  const [tab, setTab] = useState<DeskTab>('matrix');
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All Types');
  const [occupancyFilter, setOccupancyFilter] = useState('All Occupancy');
  const [roomPage, setRoomPage] = useState(1);
  const [roomPageSize, setRoomPageSize] = useState(12);
  const [bedPage, setBedPage] = useState(1);
  const [bedPageSize, setBedPageSize] = useState(24);

  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateRoom, setAllocateRoom] = useState<RoomRecord | null>(null);
  const [allocateQueueRecord, setAllocateQueueRecord] = useState<AllocationRecord | null>(null);
  const [detailRoom, setDetailRoom] = useState<RoomRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const roomFilters = useMemo(
    () => ({
      q: search,
      hostel: hostelApiFilter || 'All Hostels',
      block: blockFilter,
      floor: floorFilter,
      roomType: roomTypeFilter,
      status: 'All Status',
      occupancy: occupancyFilter,
      page: tab === 'matrix' ? roomPage : 1,
      pageSize: tab === 'matrix' ? roomPageSize : roomPageSize,
    }),
    [search, hostelApiFilter, blockFilter, floorFilter, roomTypeFilter, occupancyFilter, roomPage, roomPageSize, tab],
  );

  const bedFilters = useMemo(
    () => ({
      q: search,
      hostel: hostelApiFilter || 'All Hostels',
      block: blockFilter,
      floor: floorFilter,
      room: '',
      status: 'All Status',
      page: tab === 'beds' ? bedPage : 1,
      pageSize: tab === 'matrix' ? 200 : bedPageSize,
    }),
    [search, hostelApiFilter, blockFilter, floorFilter, bedPage, bedPageSize, tab],
  );

  const allocFilters = useMemo(
    () => ({
      q: '',
      status: 'All Status',
      type: 'All Types',
      hostel: hostelApiFilter || 'All Hostels',
      page: 1,
      pageSize: 50,
    }),
    [hostelApiFilter],
  );

  const {
    rooms,
    total: roomTotal,
    loadingList: loadingRooms,
    error: roomError,
    summary: roomSummary,
    refresh: refreshRooms,
  } = useRoomsDirectory(roomFilters, { pollIntervalMs: 60_000 });
  const { beds, total: bedTotal, loadingList: loadingBeds, refresh: refreshBeds } = useBedsDirectory(bedFilters);
  const { queue, allocations, loadingQueue, loadingList: loadingAlloc, refresh: refreshAlloc } =
    useAllocationsDirectory(allocFilters);
  const { stats: inventoryStats, loading: loadingInventory } = useWardenHostelInventoryStats(
    hostelApiFilter || 'All Hostels',
  );

  const bedsByRoomId = useMemo(() => {
    const map = new Map<string, typeof beds>();
    for (const bed of beds) {
      const list = map.get(bed.roomId) ?? [];
      list.push(bed);
      map.set(bed.roomId, list);
    }
    return map;
  }, [beds]);

  const facetOptions = useMemo(() => {
    const facets = roomSummary?.facets;
    return {
      blocks: ['All Blocks', ...(facets?.blocks ?? [])] as const,
      floors: ['All Floors', ...(facets?.floors ?? [])] as const,
      roomTypes: ['All Types', ...(facets?.roomTypes ?? [])] as const,
    };
  }, [roomSummary?.facets]);

  const pendingChanges = useMemo(
    () => allocations.filter((a) => a.type === 'Room Change' && a.status === 'Change Requested'),
    [allocations],
  );

  const hostelQueue = useMemo(
    () => queue.filter((q) => !hostelApiFilter || q.preferenceHostel === hostelApiFilter || q.hostel === hostelApiFilter),
    [queue, hostelApiFilter],
  );

  const roomTotalPages = Math.max(1, Math.ceil(roomTotal / roomPageSize));
  const bedTotalPages = Math.max(1, Math.ceil(bedTotal / bedPageSize));

  const openAssign = (opts?: { room?: RoomRecord | null; record?: AllocationRecord | null }) => {
    setAllocateRoom(opts?.room ?? null);
    setAllocateQueueRecord(opts?.record ?? null);
    setAllocateOpen(true);
  };

  const switchTab = (next: DeskTab) => {
    setTab(next);
  };

  const resetFilters = () => {
    setSearch('');
    setBlockFilter('All Blocks');
    setFloorFilter('All Floors');
    setRoomTypeFilter('All Types');
    setOccupancyFilter('All Occupancy');
    setRoomPage(1);
    setBedPage(1);
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      {roomError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {roomError}{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => {
              refreshOverview();
              refreshRooms();
            }}
          >
            Retry
          </Button>
        </p>
      ) : roomSummary?.generatedAt ? (
        <p className="text-end text-xs text-muted-foreground tabular-nums">
          Inventory synced{' '}
          {new Date(roomSummary.generatedAt).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      ) : null}

      <WardenRoomsHeader
        hostelName={hostelDisplay}
        availableBeds={inventoryStats?.availableBeds ?? roomSummary?.availableBeds ?? 0}
        occupiedBeds={inventoryStats?.occupiedBeds ?? roomSummary?.occupiedBeds ?? 0}
        onAssignBed={() => openAssign()}
      />

      <WardenRoomsStatsStrip hostelName={hostelDisplay} stats={inventoryStats} loading={loadingInventory} />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Room desk views">
        {(
          [
            { id: 'matrix' as const, label: 'Bed matrix', icon: LayoutGrid },
            { id: 'beds' as const, label: 'Bed inventory', icon: BedDouble },
            { id: 'requests' as const, label: 'Requests', icon: ArrowRightLeft },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              variant={active ? 'default' : 'outline'}
              className={cn(
                'h-10 rounded-xl px-4',
                active && 'bg-[var(--nestora-forest)] text-white hover:bg-[var(--nestora-forest)]/90',
                focusRing,
              )}
              onClick={() => switchTab(item.id)}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Button>
          );
        })}
      </div>

      {tab !== 'requests' ? (
        <WardenRoomsFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setRoomPage(1);
            setBedPage(1);
          }}
          blockFilter={blockFilter}
          onBlockFilterChange={(v) => {
            setBlockFilter(v);
            setRoomPage(1);
          }}
          floorFilter={floorFilter}
          onFloorFilterChange={(v) => {
            setFloorFilter(v);
            setRoomPage(1);
          }}
          roomTypeFilter={roomTypeFilter}
          onRoomTypeFilterChange={(v) => {
            setRoomTypeFilter(v);
            setRoomPage(1);
          }}
          occupancyFilter={occupancyFilter}
          onOccupancyFilterChange={(v) => {
            setOccupancyFilter(v);
            setRoomPage(1);
          }}
          filteredCount={tab === 'matrix' ? roomTotal : bedTotal}
          blockOptions={facetOptions.blocks}
          floorOptions={facetOptions.floors}
          roomTypeOptions={facetOptions.roomTypes}
          onReset={resetFilters}
        />
      ) : null}

      <motion.div
        key={tab}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: motionEase }}
      >
        {tab === 'matrix' ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <WardenRoomsMatrix
              rooms={rooms}
              bedsByRoomId={bedsByRoomId}
              loading={loadingRooms}
              onOpenRoom={(room) => {
                setDetailRoom(room);
                setDetailOpen(true);
              }}
              onAssignBedInRoom={(room) => openAssign({ room })}
            />
            <WardenRoomsFloorHeatmap rooms={rooms} />
          </div>
        ) : null}

        {tab === 'beds' ? (
          <WardenRoomsBedDirectory
            beds={beds}
            loading={loadingBeds}
            page={bedPage}
            totalPages={bedTotalPages}
            pageSize={bedPageSize}
            onPageChange={setBedPage}
            onPageSizeChange={(n) => {
              setBedPageSize(n);
              setBedPage(1);
            }}
          />
        ) : null}

        {tab === 'requests' ? (
          <WardenRoomsRequests
            queue={hostelQueue}
            pendingChanges={pendingChanges}
            loading={loadingQueue || loadingAlloc}
            onAssign={(record) => openAssign({ record })}
          />
        ) : null}
      </motion.div>

      {tab === 'matrix' && roomTotalPages > 1 ? (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={roomPage <= 1}
            onClick={() => setRoomPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            Page {roomPage} / {roomTotalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={roomPage >= roomTotalPages}
            onClick={() => setRoomPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <p className="text-[11px] text-muted-foreground" role="note">
        Inventory is scoped to <strong className="font-semibold text-foreground">{hostelDisplay}</strong>. Allocation
        history is immutable (FR-031). Cross-hostel assignment is not permitted.
      </p>

      <WardenRoomsAllocateSheet
        open={allocateOpen}
        onOpenChange={(open) => {
          setAllocateOpen(open);
          if (!open) {
            setAllocateRoom(null);
            setAllocateQueueRecord(null);
            void refreshRooms();
            void refreshBeds();
            void refreshAlloc();
          }
        }}
        hostelName={hostelDisplay}
        presetRoom={allocateRoom}
        queueRecord={allocateQueueRecord}
      />

      <WardenRoomsRoomSheet room={detailRoom} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
