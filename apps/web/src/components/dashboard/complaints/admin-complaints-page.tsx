'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminComplaintsAssignDrawer } from '@/components/dashboard/complaints/admin-complaints-assign-drawer';
import { AdminComplaintsFiltersBar } from '@/components/dashboard/complaints/admin-complaints-filters-bar';
import { AdminComplaintsKanban } from '@/components/dashboard/complaints/admin-complaints-kanban';
import { AdminComplaintsList } from '@/components/dashboard/complaints/admin-complaints-list';
import { AdminComplaintsPageHeader } from '@/components/dashboard/complaints/admin-complaints-page-header';
import { AdminComplaintsStatsStrip } from '@/components/dashboard/complaints/admin-complaints-stats-strip';
import {
  SAMPLE_COMPLAINTS,
  effectivePriority,
  type ComplaintPriority,
  type ComplaintTicket,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

export function AdminComplaintsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const [tickets, setTickets] = useState<ComplaintTicket[]>(SAMPLE_COMPLAINTS);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((row) => {
      if (hostelFilter !== 'All Hostels' && row.hostel !== hostelFilter) return false;
      if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
      if (priorityFilter !== 'All Priorities' && effectivePriority(row) !== priorityFilter) return false;
      if (statusFilter !== 'All Status' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.ticketNumber.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q) ||
        row.studentId.toLowerCase().includes(q) ||
        row.location.toLowerCase().includes(q)
      );
    });
  }, [tickets, search, hostelFilter, categoryFilter, priorityFilter, statusFilter]);

  const listKey = `${search}|${hostelFilter}|${categoryFilter}|${priorityFilter}|${statusFilter}|${view}`;

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

  const onAssigned = (ticketId: string, staffName: string, priority: ComplaintPriority) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              assignedStaff: staffName,
              finalPriority: priority,
              status: t.status === 'Submitted' || t.status === 'Under Review' || t.status === 'Reopened' ? 'Assigned' : t.status,
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    );
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminComplaintsPageHeader
        onAssign={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        boardRef={boardRef}
      />
      <AdminComplaintsStatsStrip />
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
      />
      <div ref={boardRef}>
        <AdminComplaintsKanban tickets={filtered} listKey={listKey} hidden={view !== 'board'} />
        <AdminComplaintsList tickets={filtered} hidden={view !== 'list'} />
      </div>
      <AdminComplaintsAssignDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onAssigned={onAssigned} />
    </div>
  );
}
