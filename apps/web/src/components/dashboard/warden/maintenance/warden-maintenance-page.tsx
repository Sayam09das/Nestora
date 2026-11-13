'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminComplaintsAssignDrawer } from '@/components/dashboard/complaints/admin-complaints-assign-drawer';
import { AdminComplaintsFiltersBar } from '@/components/dashboard/complaints/admin-complaints-filters-bar';
import { AdminComplaintsKanban } from '@/components/dashboard/complaints/admin-complaints-kanban';
import { AdminComplaintsList } from '@/components/dashboard/complaints/admin-complaints-list';
import { AdminComplaintsStatsStrip } from '@/components/dashboard/complaints/admin-complaints-stats-strip';
import type { ComplaintTicket } from '@/components/dashboard/complaints/admin-complaints-data';
import {
  WardenMaintenanceHeader,
  type WardenMaintenanceLens,
} from '@/components/dashboard/warden/maintenance/warden-maintenance-header';
import { WardenMaintenanceRoomsPanel } from '@/components/dashboard/warden/maintenance/warden-maintenance-rooms-panel';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useComplaintsDesk } from '@/hooks/use-complaints-desk';
import { useRoomsDirectory } from '@/hooks/use-rooms-directory';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

const DETAIL_BASE = '/warden/maintenance';

function lensTickets(tickets: ComplaintTicket[], lens: WardenMaintenanceLens): ComplaintTicket[] {
  if (lens === 'queue') {
    return tickets.filter((t) => t.status === 'Assigned' || t.status === 'In Progress');
  }
  if (lens === 'pipeline') {
    return tickets.filter((t) => !['Resolved', 'Rejected'].includes(t.status));
  }
  return tickets;
}

export function WardenMaintenancePage() {
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

  const [lens, setLens] = useState<WardenMaintenanceLens>('queue');
  const [view, setView] = useState<'board' | 'list'>('list');
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

  const roomFilters = useMemo(
    () => ({
      q: search,
      hostel: hostelScope,
      block: 'All Blocks',
      floor: 'All Floors',
      roomType: 'All Types',
      status: 'Maintenance',
      occupancy: 'All Occupancy',
      page: 1,
      pageSize: 80,
    }),
    [search, hostelScope],
  );

  const {
    rooms: maintenanceRooms,
    summary: roomSummary,
    loadingList: loadingRooms,
    error: roomError,
    refresh: refreshRooms,
  } = useRoomsDirectory(roomFilters, { pollIntervalMs: 20_000 });

  const workQueueCount = useMemo(
    () => tickets.filter((t) => t.status === 'Assigned' || t.status === 'In Progress').length,
    [tickets],
  );

  const visibleTickets = useMemo(() => lensTickets(tickets, lens), [tickets, lens]);

  const maintenanceRoomCount = roomSummary?.maintenanceRooms ?? maintenanceRooms.length;

  const listKey = `${lens}|${search}|${hostelScope}|${categoryFilter}|${priorityFilter}|${statusFilter}|${view}|${visibleTickets.length}`;

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

  const onAssigned = (ticket: ComplaintTicket) => {
    patchTicket(ticket.id, ticket);
    void refresh();
  };

  const displayError = error ?? (lens === 'rooms' ? roomError : null);

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <WardenMaintenanceHeader
        hostelName={hostelDisplay}
        lens={lens}
        onLensChange={setLens}
        view={view}
        onViewChange={setView}
        boardRef={boardRef}
        onAssign={() => setDrawerOpen(true)}
        summary={summary}
        workQueueCount={workQueueCount}
        maintenanceRooms={maintenanceRoomCount}
        loading={loadingSummary}
      />
      {displayError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
        >
          <p className="text-destructive">{displayError}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={() => {
              void refresh();
              void refreshRooms();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}
      <AdminComplaintsStatsStrip summary={summary} loading={loadingSummary} />
      {lens === 'rooms' ? (
        <WardenMaintenanceRoomsPanel rooms={maintenanceRooms} loading={loadingRooms} hostelName={hostelDisplay} />
      ) : (
        <>
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
            {loadingList && visibleTickets.length === 0 ? (
              <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
                Loading work orders…
              </div>
            ) : visibleTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                {lens === 'queue'
                  ? 'No tickets are assigned or in progress for this hostel. Try Open pipeline or assign from Complaints.'
                  : 'No open maintenance tickets match these filters.'}
              </div>
            ) : (
              <>
                <AdminComplaintsKanban
                  tickets={visibleTickets}
                  listKey={listKey}
                  hidden={view !== 'board'}
                  detailBasePath={DETAIL_BASE}
                />
                <AdminComplaintsList tickets={visibleTickets} hidden={view !== 'list'} detailBasePath={DETAIL_BASE} />
              </>
            )}
          </div>
        </>
      )}
      <AdminComplaintsAssignDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAssigned={onAssigned}
        tickets={tickets}
      />
    </div>
  );
}
