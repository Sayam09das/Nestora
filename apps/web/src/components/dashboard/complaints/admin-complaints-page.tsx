'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminComplaintsAssignDrawer } from '@/components/dashboard/complaints/admin-complaints-assign-drawer';
import { AdminComplaintsFiltersBar } from '@/components/dashboard/complaints/admin-complaints-filters-bar';
import { AdminComplaintsKanban } from '@/components/dashboard/complaints/admin-complaints-kanban';
import { AdminComplaintsList } from '@/components/dashboard/complaints/admin-complaints-list';
import { AdminComplaintsPageHeader } from '@/components/dashboard/complaints/admin-complaints-page-header';
import { AdminComplaintsStatsStrip } from '@/components/dashboard/complaints/admin-complaints-stats-strip';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useComplaintsDesk } from '@/hooks/use-complaints-desk';

export function AdminComplaintsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'board' | 'list'>('board');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelFilter,
      category: categoryFilter,
      priority: priorityFilter,
      status: statusFilter,
    }),
    [search, hostelFilter, categoryFilter, priorityFilter, statusFilter],
  );

  const { summary, tickets, loadingSummary, loadingList, error, refresh, patchTicket } =
    useComplaintsDesk(filters);

  const facetHostels = useMemo(() => {
    const hostels = summary?.facets.hostels ?? [];
    return ['All Hostels', ...hostels] as const;
  }, [summary?.facets.hostels]);

  const listKey = `${search}|${hostelFilter}|${categoryFilter}|${priorityFilter}|${statusFilter}|${view}|${tickets.length}`;

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
    setHostelFilter('All Hostels');
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
      <AdminComplaintsPageHeader
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
        hostelFilter={hostelFilter}
        onHostelFilterChange={setHostelFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
        hostelOptions={facetHostels}
      />
      <div ref={boardRef}>
        {loadingList && tickets.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
            Loading tickets…
          </div>
        ) : (
          <>
            <AdminComplaintsKanban tickets={tickets} listKey={listKey} hidden={view !== 'board'} />
            <AdminComplaintsList tickets={tickets} hidden={view !== 'list'} />
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
