'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminLeaveDirectory } from '@/components/dashboard/leave/admin-leave-directory';
import { AdminLeaveFiltersBar } from '@/components/dashboard/leave/admin-leave-filters-bar';
import { AdminLeaveQueuePanel } from '@/components/dashboard/leave/admin-leave-queue-panel';
import { AdminLeaveReviewDrawer } from '@/components/dashboard/leave/admin-leave-review-drawer';
import { AdminLeaveStatsStrip } from '@/components/dashboard/leave/admin-leave-stats-strip';
import { queueLeaves, type LeaveRecord } from '@/components/dashboard/leave/admin-leave-data';
import { WardenLeaveHeader } from '@/components/dashboard/warden/leave/warden-leave-header';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useLeaveDesk } from '@/hooks/use-leave-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { patchLeaveDecision } from '@/lib/api/leaves';

export function WardenLeavePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter ||
    (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [lens, setLens] = useState<'queue' | 'directory'>('queue');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<LeaveRecord | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [gatePassLogView, setGatePassLogView] = useState(false);

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelScope,
      category: categoryFilter,
      status: statusFilter,
    }),
    [search, hostelScope, categoryFilter, statusFilter],
  );

  const { summary, applications, loadingSummary, loadingList, error, refresh, patchApplication } = useLeaveDesk(
    filters,
    { pollIntervalMs: 20_000, summaryHostel: hostelScope },
  );

  const queue = useMemo(() => queueLeaves(applications), [applications]);
  const effectiveSelectedId =
    selectedQueueId && queue.some((q) => q.id === selectedQueueId) ? selectedQueueId : (queue[0]?.id ?? '');

  const listKey = `${search}|${hostelScope}|${categoryFilter}|${statusFilter}|${lens}|${applications.length}`;

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
    setCategoryFilter('All Categories');
    setStatusFilter('All Status');
  };

  const openReview = (record?: LeaveRecord) => {
    const target =
      record ??
      queue.find((q) => q.status === 'Pending Review' || q.status === 'Extension Pending') ??
      queue.find((q) => q.status === 'Overstayed') ??
      queue[0];
    if (!target) {
      toast.message('No items in the warden queue match your filters.');
      return;
    }
    setReviewTarget(target);
    setDrawerOpen(true);
  };

  const openGatePassLog = () => {
    setGatePassLogView(true);
    setLens('directory');
    setStatusFilter('All Status');
    toast.message('Gate pass log — showing residents with issued passes.');
    requestAnimationFrame(() => {
      flipRootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const directoryRows = useMemo(() => {
    if (!gatePassLogView) return applications;
    return applications.filter((row) => Boolean(row.gatePassToken));
  }, [applications, gatePassLogView]);

  const handleLensChange = (next: 'queue' | 'directory') => {
    if (next === 'queue') setGatePassLogView(false);
    setLens(next);
  };

  const onDecided = async (id: string, decision: 'Approved' | 'Rejected', feedback: string) => {
    const result = await patchLeaveDecision({ leaveId: id, decision, feedback: feedback || undefined });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.application) {
      patchApplication(id, result.application);
    }
    void refresh();
  };

  const loading = loadingSummary && loadingList && !summary && applications.length === 0;

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <WardenLeaveHeader
        hostelName={hostelDisplay}
        onReview={() => openReview()}
        onGatePassLog={openGatePassLog}
        lens={lens}
        onLensChange={handleLensChange}
        flipRootRef={flipRootRef}
        summary={summary}
        loading={loadingSummary}
      />
      <AdminLeaveStatsStrip summary={summary} loading={loadingSummary} />
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}
      <AdminLeaveFiltersBar
        search={search}
        onSearchChange={setSearch}
        hostelFilter={hostelScope}
        onHostelFilterChange={() => {}}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
        hostelOptions={[hostelScope]}
        showHostelFilter={false}
      />
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading leave desk…
        </div>
      ) : (
        <div ref={flipRootRef} data-leave-reveal>
          <AdminLeaveQueuePanel
            queue={queue}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedQueueId}
            onReview={openReview}
            listKey={listKey}
            hidden={lens !== 'queue'}
          />
          <AdminLeaveDirectory rows={directoryRows} hidden={lens !== 'directory'} gatePassLog={gatePassLogView} />
        </div>
      )}
      <AdminLeaveReviewDrawer open={drawerOpen} onOpenChange={setDrawerOpen} record={reviewTarget} onDecided={onDecided} />
    </div>
  );
}
