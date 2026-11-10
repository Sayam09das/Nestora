'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminAllocationAllocateDrawer } from '@/components/dashboard/allocation/admin-allocation-allocate-drawer';
import { AdminAllocationDirectory } from '@/components/dashboard/allocation/admin-allocation-directory';
import { AdminAllocationFiltersBar } from '@/components/dashboard/allocation/admin-allocation-filters-bar';
import { AdminAllocationPageHeader } from '@/components/dashboard/allocation/admin-allocation-page-header';
import { AdminAllocationQueuePanel } from '@/components/dashboard/allocation/admin-allocation-queue-panel';
import { AdminAllocationStatsStrip } from '@/components/dashboard/allocation/admin-allocation-stats-strip';
import {
  SAMPLE_ALLOCATIONS,
  queueAllocations,
  type AllocationRecord,
} from '@/components/dashboard/allocation/admin-allocation-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_ALLOCATIONS.filter((row) => {
      if (statusFilter !== 'All Status' && row.status !== statusFilter) return false;
      if (typeFilter !== 'All Types' && row.type !== typeFilter) return false;
      if (hostelFilter !== 'All Hostels') {
        const hostel = row.hostel ?? row.preferenceHostel;
        if (hostel !== hostelFilter) return false;
      }
      if (!q) return true;
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.studentId.toLowerCase().includes(q) ||
        row.allocationRef.toLowerCase().includes(q) ||
        (row.bedId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [search, statusFilter, typeFilter, hostelFilter]);

  const queue = useMemo(() => queueAllocations(filtered), [filtered]);

  const effectiveSelectedId = selectedQueueId && queue.some((q) => q.id === selectedQueueId) ? selectedQueueId : (queue[0]?.id ?? '');

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const listKey = `${search}|${statusFilter}|${typeFilter}|${hostelFilter}|${safePage}`;

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
      <AdminAllocationPageHeader onAllocate={() => openAssign()} />
      <AdminAllocationStatsStrip />
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
      />
      <AdminAllocationQueuePanel
        queue={queue}
        selectedId={effectiveSelectedId}
        onSelect={setSelectedQueueId}
        onAssignBed={openAssign}
        listKey={listKey}
      />
      <AdminAllocationDirectory
        pageRows={pageRows}
        filteredCount={filtered.length}
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
      <AdminAllocationAllocateDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
