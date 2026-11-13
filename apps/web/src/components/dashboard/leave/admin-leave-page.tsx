'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminLeaveDirectory } from '@/components/dashboard/leave/admin-leave-directory';
import { AdminLeaveFiltersBar } from '@/components/dashboard/leave/admin-leave-filters-bar';
import { AdminLeavePageHeader } from '@/components/dashboard/leave/admin-leave-page-header';
import { AdminLeaveQueuePanel } from '@/components/dashboard/leave/admin-leave-queue-panel';
import { AdminLeaveReviewDrawer } from '@/components/dashboard/leave/admin-leave-review-drawer';
import { AdminLeaveStatsStrip } from '@/components/dashboard/leave/admin-leave-stats-strip';
import { queueLeaves, type LeaveRecord } from '@/components/dashboard/leave/admin-leave-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useLeaveDesk } from '@/hooks/use-leave-desk';

export function AdminLeavePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [lens, setLens] = useState<'queue' | 'directory'>('queue');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<LeaveRecord | null>(null);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [gatePassLogView, setGatePassLogView] = useState(false);

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelFilter,
      category: categoryFilter,
      status: statusFilter,
    }),
    [search, hostelFilter, categoryFilter, statusFilter],
  );

  const { summary, applications, loadingSummary, loadingList, error, refresh, patchApplication } =
    useLeaveDesk(filters);

  const facetHostels = useMemo(() => {
    const hostels = summary?.facets.hostels ?? [];
    return ['All Hostels', ...hostels] as const;
  }, [summary?.facets.hostels]);

  const queue = useMemo(() => queueLeaves(applications), [applications]);
  const effectiveSelectedId =
    selectedQueueId && queue.some((q) => q.id === selectedQueueId) ? selectedQueueId : (queue[0]?.id ?? '');

  const listKey = `${search}|${hostelFilter}|${categoryFilter}|${statusFilter}|${lens}|${applications.length}`;

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

  const onDecided = (id: string, decision: 'Approved' | 'Rejected', _feedback: string) => {
    patchApplication(id, {
      status: decision === 'Approved' ? 'Approved' : 'Rejected',
      reviewedBy: 'Warden (pending API)',
    });
    void refresh();
  };

  const loading = loadingSummary && loadingList && !summary && applications.length === 0;

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminLeavePageHeader
        onReview={() => openReview()}
        onGatePassLog={openGatePassLog}
        lens={lens}
        onLensChange={handleLensChange}
        flipRootRef={flipRootRef}
        summary={summary}
        loading={loadingSummary}
      />
      <AdminLeaveStatsStrip summary={summary} loading={loadingSummary} />
      {error ? <ErrorBanner error={error} onRetry={refresh} /> : null}
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
        hostelOptions={facetHostels}
      />
      {loading ? (
        <LoadingState />
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

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <span>{error}</span>
      <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      Loading leave desk…
    </div>
  );
}
