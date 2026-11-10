'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminHostelsAddDrawer } from '@/components/dashboard/hostels/admin-hostels-add-drawer';
import { AdminHostelsDirectory } from '@/components/dashboard/hostels/admin-hostels-directory';
import { AdminHostelsFiltersBar } from '@/components/dashboard/hostels/admin-hostels-filters-bar';
import { AdminHostelsPageHeader } from '@/components/dashboard/hostels/admin-hostels-page-header';
import { AdminHostelsStatsStrip } from '@/components/dashboard/hostels/admin-hostels-stats-strip';
import { canDeleteHostel, type HostelRecord } from '@/components/dashboard/hostels/admin-hostels-data';
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
import { useHostelsDirectory } from '@/hooks/use-hostels-directory';

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

  const filters = useMemo(
    () => ({
      q: search,
      gender: genderFilter,
      campus: campusFilter,
      status: statusFilter,
      occupancy: occupancyFilter,
      page,
      pageSize,
    }),
    [search, genderFilter, campusFilter, statusFilter, occupancyFilter, page, pageSize],
  );

  const { summary, hostels, total, loadingSummary, loadingList, error, refresh } = useHostelsDirectory(filters);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = hostels;
  const listKey = `${search}|${genderFilter}|${campusFilter}|${statusFilter}|${occupancyFilter}|${safePage}|${total}`;

  const facetOptions = useMemo(() => {
    const facets = summary?.facets;
    return {
      genders: ['All Categories', ...(facets?.genders ?? [])] as const,
      campuses: ['All Campus Zones', ...(facets?.campuses ?? [])] as const,
    };
  }, [summary?.facets]);

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
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <Button type="button" variant="link" className="h-auto p-0 text-destructive" onClick={() => refresh()}>
            Retry
          </Button>
        </p>
      ) : null}

      <AdminHostelsPageHeader onAdd={() => setAddOpen(true)} summary={summary} loading={loadingSummary} />
      <AdminHostelsStatsStrip summary={summary} loading={loadingSummary} />

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
        genderOptions={facetOptions.genders}
        campusOptions={facetOptions.campuses}
      />

      {loadingList ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading hostels…
        </div>
      ) : (
        <AdminHostelsDirectory
          pageRows={pageRows}
          filteredCount={total}
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
      )}

      <AdminHostelsAddDrawer open={addOpen} onOpenChange={setAddOpen} />
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget && canDeleteHostel(deleteTarget) ? 'Delete hostel?' : 'Deactivate instead?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && canDeleteHostel(deleteTarget)
                ? `${deleteTarget.name} has no linked rooms. Permanent deletion is not wired in this build; use deactivate for production workflows.`
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
