'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminBedsAddDrawer } from '@/components/dashboard/beds/admin-beds-add-drawer';
import { AdminBedsDirectory } from '@/components/dashboard/beds/admin-beds-directory';
import { AdminBedsFiltersBar } from '@/components/dashboard/beds/admin-beds-filters-bar';
import { AdminBedsPageHeader } from '@/components/dashboard/beds/admin-beds-page-header';
import { AdminBedsStatsStrip } from '@/components/dashboard/beds/admin-beds-stats-strip';
import type { BedRecord } from '@/components/dashboard/beds/admin-beds-data';
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
import { useBedsDirectory } from '@/hooks/use-beds-directory';

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

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelFilter,
      block: blockFilter,
      floor: floorFilter,
      room: roomFilter,
      status: statusFilter,
      page,
      pageSize,
    }),
    [search, hostelFilter, blockFilter, floorFilter, roomFilter, statusFilter, page, pageSize],
  );

  const { summary, beds, total, loadingSummary, loadingList, error, refresh } = useBedsDirectory(filters);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = beds;

  const facetOptions = useMemo(() => {
    const facets = summary?.facets;
    return {
      hostels: ['All Hostels', ...(facets?.hostels ?? [])] as const,
      blocks: ['All Blocks', ...(facets?.blocks ?? [])] as const,
      floors: ['All Floors', ...(facets?.floors ?? [])] as const,
      rooms: ['All Rooms', ...(facets?.rooms ?? [])] as const,
    };
  }, [summary?.facets]);

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
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <Button type="button" variant="link" className="h-auto p-0 text-destructive" onClick={() => refresh()}>
            Retry
          </Button>
        </p>
      ) : null}

      <AdminBedsPageHeader summary={summary} loading={loadingSummary} onAddBed={() => setAddOpen(true)} />
      <AdminBedsStatsStrip summary={summary} loading={loadingSummary} />

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
        filteredCount={total}
        hostelOptions={facetOptions.hostels}
        blockOptions={facetOptions.blocks}
        floorOptions={facetOptions.floors}
        roomOptions={facetOptions.rooms}
      />

      {loadingList ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading beds…
        </div>
      ) : (
        <AdminBedsDirectory
          pageRows={pageRows}
          filteredCount={total}
          totalBeds={summary?.totalBeds ?? 0}
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
          listKey={`${safePage}-${pageSize}-${total}-${search}`}
        />
      )}

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
