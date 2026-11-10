'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminLeaveDirectory } from '@/components/dashboard/leave/admin-leave-directory';
import { AdminLeaveFiltersBar } from '@/components/dashboard/leave/admin-leave-filters-bar';
import { AdminLeavePageHeader } from '@/components/dashboard/leave/admin-leave-page-header';
import { AdminLeaveQueuePanel } from '@/components/dashboard/leave/admin-leave-queue-panel';
import { AdminLeaveReviewDrawer } from '@/components/dashboard/leave/admin-leave-review-drawer';
import { AdminLeaveStatsStrip } from '@/components/dashboard/leave/admin-leave-stats-strip';
import {
  SAMPLE_LEAVES,
  queueLeaves,
  type LeaveRecord,
} from '@/components/dashboard/leave/admin-leave-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

export function AdminLeavePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [leaves, setLeaves] = useState<LeaveRecord[]>(SAMPLE_LEAVES);
  const [lens, setLens] = useState<'queue' | 'directory'>('queue');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<LeaveRecord | null>(null);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedQueueId, setSelectedQueueId] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leaves.filter((row) => {
      if (hostelFilter !== 'All Hostels' && row.hostel !== hostelFilter) return false;
      if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
      if (statusFilter !== 'All Status' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.studentId.toLowerCase().includes(q) ||
        row.leaveRef.toLowerCase().includes(q) ||
        row.destination.toLowerCase().includes(q)
      );
    });
  }, [leaves, search, hostelFilter, categoryFilter, statusFilter]);

  const queue = useMemo(() => queueLeaves(filtered), [filtered]);
  const effectiveSelectedId =
    selectedQueueId && queue.some((q) => q.id === selectedQueueId) ? selectedQueueId : (queue[0]?.id ?? '');

  const listKey = `${search}|${hostelFilter}|${categoryFilter}|${statusFilter}|${lens}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-leave-reveal]'), {
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
    setStatusFilter('All Status');
  };

  const openReview = (record?: LeaveRecord) => {
    const target = record ?? queue.find((q) => q.status === 'Pending Review') ?? queue[0];
    if (!target) return;
    setReviewTarget(target);
    setDrawerOpen(true);
  };

  const onDecided = (id: string, decision: 'Approved' | 'Rejected', _feedback: string) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: decision === 'Approved' ? (l.status === 'Extension Pending' ? 'On Leave' : 'Approved') : 'Rejected',
              reviewedBy: 'Warden (sample)',
              gatePassToken: decision === 'Approved' ? `GP-${Math.random().toString(16).slice(2, 8).toUpperCase()}` : l.gatePassToken,
            }
          : l,
      ),
    );
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminLeavePageHeader onReview={() => openReview()} lens={lens} onLensChange={setLens} flipRootRef={flipRootRef} />
      <AdminLeaveStatsStrip />
      <AdminLeaveFiltersBar
        search={search}
        onSearchChange={setSearch}
        hostelFilter={hostelFilter}
        onHostelFilterChange={setHostelFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
      />
      <div ref={flipRootRef}>
        <AdminLeaveQueuePanel
          queue={queue}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedQueueId}
          onReview={openReview}
          listKey={listKey}
          hidden={lens !== 'queue'}
        />
        <AdminLeaveDirectory rows={filtered} hidden={lens !== 'directory'} />
      </div>
      <AdminLeaveReviewDrawer open={drawerOpen} onOpenChange={setDrawerOpen} record={reviewTarget} onDecided={onDecided} />
    </div>
  );
}
