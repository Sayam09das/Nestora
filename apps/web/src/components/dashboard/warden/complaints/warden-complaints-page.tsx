'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminComplaintsAssignDrawer } from '@/components/dashboard/complaints/admin-complaints-assign-drawer';
import { AdminComplaintsFiltersBar } from '@/components/dashboard/complaints/admin-complaints-filters-bar';
import { AdminComplaintsKanban } from '@/components/dashboard/complaints/admin-complaints-kanban';
import { AdminComplaintsList } from '@/components/dashboard/complaints/admin-complaints-list';
import { AdminComplaintsStatsStrip } from '@/components/dashboard/complaints/admin-complaints-stats-strip';
import { WardenComplaintsHeader } from '@/components/dashboard/warden/complaints/warden-complaints-header';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useComplaintsDesk } from '@/hooks/use-complaints-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

const DETAIL_BASE = '/warden/complaints';

export function WardenComplaintsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [view, setView] = useState<'board' | 'list'>('board');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelScope,
      category: categoryFilter,
      priority: priorityFilter,
      status: statusFilter,
    }),
    [search, hostelScope, categoryFilter, priorityFilter, statusFilter],
  );

  const { summary, tickets, loadingSummary, loadingList, error, refresh, patchTicket } = useComplaintsDesk(filters, {
    pollIntervalMs: 20_000,
    summaryHostel: hostelScope,
  });

  const listKey = `${search}|${hostelScope}|${categoryFilter}|${priorityFilter}|${statusFilter}|${view}|${tickets.length}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-cmp-reveal]'), {
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
    setPriorityFilter('All Priorities');
    setStatusFilter('All Status');
  };

  const onAssigned = (ticket: import('@/components/dashboard/complaints/admin-complaints-data').ComplaintTicket) => {
    patchTicket(ticket.id, ticket);
    void refresh();
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <WardenComplaintsHeader
        hostelName={hostelDisplay}
        onAssign={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        boardRef={boardRef}
        summary={summary}
        loading={loadingSummary}
      />
      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
        >
          <p className="text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}
      <AdminComplaintsStatsStrip summary={summary} loading={loadingSummary} />
      <AdminComplaintsFiltersBar
        search={search}
        onSearchChange={setSearch}
        hostelFilter={hostelScope}
        onHostelFilterChange={() => {}}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
        hostelOptions={[hostelScope]}
        showHostelFilter={false}
      />
      <div ref={boardRef}>
        {loadingList && tickets.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
            Loading tickets…
          </div>
        ) : (
          <>
            <AdminComplaintsKanban
              tickets={tickets}
              listKey={listKey}
              hidden={view !== 'board'}
              detailBasePath={DETAIL_BASE}
            />
            <AdminComplaintsList tickets={tickets} hidden={view !== 'list'} detailBasePath={DETAIL_BASE} />
          </>
        )}
      </div>
      <AdminComplaintsAssignDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAssigned={onAssigned}
        tickets={tickets}
      />
    </div>
  );
}
