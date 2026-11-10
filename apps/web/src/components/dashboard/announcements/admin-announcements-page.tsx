'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminAnnouncementsComposeDrawer } from '@/components/dashboard/announcements/admin-announcements-compose-drawer';
import { AdminAnnouncementsFeed } from '@/components/dashboard/announcements/admin-announcements-feed';
import { AdminAnnouncementsFiltersBar } from '@/components/dashboard/announcements/admin-announcements-filters-bar';
import { AdminAnnouncementsList } from '@/components/dashboard/announcements/admin-announcements-list';
import { AdminAnnouncementsPageHeader } from '@/components/dashboard/announcements/admin-announcements-page-header';
import { AdminAnnouncementsStatsStrip } from '@/components/dashboard/announcements/admin-announcements-stats-strip';
import { SAMPLE_ANNOUNCEMENTS } from '@/components/dashboard/announcements/admin-announcements-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

export function AdminAnnouncementsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'feed' | 'registry'>('feed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [scopeFilter, setScopeFilter] = useState('All Scopes');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_ANNOUNCEMENTS.filter((row) => {
      if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
      if (scopeFilter !== 'All Scopes' && row.scope !== scopeFilter) return false;
      if (statusFilter !== 'All Status' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.noticeRef.toLowerCase().includes(q) ||
        row.publishedBy.toLowerCase().includes(q) ||
        row.excerpt.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter, scopeFilter, statusFilter]);

  const listKey = `${search}|${categoryFilter}|${scopeFilter}|${statusFilter}|${view}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-ann-reveal]'), {
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
    setScopeFilter('All Scopes');
    setStatusFilter('All Status');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminAnnouncementsPageHeader
        onCompose={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
      />
      <AdminAnnouncementsStatsStrip />
      <AdminAnnouncementsFiltersBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        scopeFilter={scopeFilter}
        onScopeFilterChange={setScopeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
      />
      <div ref={flipRootRef}>
        <AdminAnnouncementsFeed notices={filtered} listKey={listKey} hidden={view !== 'feed'} />
        <AdminAnnouncementsList rows={filtered} hidden={view !== 'registry'} />
      </div>
      <AdminAnnouncementsComposeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
