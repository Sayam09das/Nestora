'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminAllocationAllocateDrawer } from '@/components/dashboard/allocation/admin-allocation-allocate-drawer';
import { AdminAllocationDirectory } from '@/components/dashboard/allocation/admin-allocation-directory';
import { AdminAllocationFiltersBar } from '@/components/dashboard/allocation/admin-allocation-filters-bar';
import { AdminAllocationPageHeader } from '@/components/dashboard/allocation/admin-allocation-page-header';
import { AdminAllocationQueuePanel } from '@/components/dashboard/allocation/admin-allocation-queue-panel';
import { AdminAllocationStatsStrip } from '@/components/dashboard/allocation/admin-allocation-stats-strip';
import type { AllocationRecord } from '@/components/dashboard/allocation/admin-allocation-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useAllocationsDirectory } from '@/hooks/use-allocations-directory';

export function AdminAllocationPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);
  const [selectedQueueId, setSelectedQueueId] = useState('');

  const filters = useMemo(
    () => ({
      q: search,
      status: statusFilter,
      type: typeFilter,
      hostel: hostelFilter,
      page,
      pageSize,
    }),
    [search, statusFilter, typeFilter, hostelFilter, page, pageSize],
  );

  const { summary, allocations, queue, total, loadingSummary, loadingList, loadingQueue, error, refresh } =
    useAllocationsDirectory(filters);

  const filteredQueue = useMemo(() => {
    if (hostelFilter === 'All Hostels') return queue;
    return queue.filter((row) => {
      const hostel = row.hostel ?? row.preferenceHostel;
      return hostel === hostelFilter;
    });
  }, [queue, hostelFilter]);

  const effectiveSelectedId =
    selectedQueueId && filteredQueue.some((q) => q.id === selectedQueueId)
      ? selectedQueueId
      : (filteredQueue[0]?.id ?? '');

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = allocations;
  const listKey = `${search}|${statusFilter}|${typeFilter}|${hostelFilter}|${safePage}|${total}`;

  const facetOptions = useMemo(() => {
    const hostels = summary?.facets?.hostels ?? [];
    return {
      hostels: ['All Hostels', ...hostels] as const,
    };
  }, [summary?.facets]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-alloc-reveal]'), {
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
    setStatusFilter('All Status');
    setTypeFilter('All Types');
    setHostelFilter('All Hostels');
    setPage(1);
  };

  const openAssign = (_record?: AllocationRecord) => {
    setDrawerOpen(true);
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      {error ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-semibold text-[var(--nestora-forest)]">Live data temporarily unavailable</p>
          <p className="mt-1 text-destructive">{error}</p>
          <Button type="button" variant="link" className="mt-1 h-auto p-0 text-destructive" onClick={() => refresh()}>
            Retry now
          </Button>
        </div>
      ) : null}

      <AdminAllocationPageHeader onAllocate={() => openAssign()} summary={summary} loading={loadingSummary} />
      <AdminAllocationStatsStrip summary={summary} loading={loadingSummary} />

      <AdminAllocationFiltersBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(v) => {
          setTypeFilter(v);
          setPage(1);
        }}
        hostelFilter={hostelFilter}
        onHostelFilterChange={(v) => {
          setHostelFilter(v);
          setPage(1);
        }}
        onReset={reset}
        hostelOptions={facetOptions.hostels}
      />

      {loadingQueue ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading queue…
        </div>
      ) : (
        <AdminAllocationQueuePanel
          queue={filteredQueue}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedQueueId}
          onAssignBed={openAssign}
          listKey={listKey}
        />
      )}

      {loadingList ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading allocations…
        </div>
      ) : (
        <AdminAllocationDirectory
          pageRows={pageRows}
          filteredCount={total}
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

      <AdminAllocationAllocateDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
