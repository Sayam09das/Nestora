'use client';

import { useReducedMotion } from 'framer-motion';
import { Building2, CalendarRange, Loader2, Megaphone } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminAnnouncementsComposeDrawer } from '@/components/dashboard/announcements/admin-announcements-compose-drawer';
import { AdminAnnouncementsFeed } from '@/components/dashboard/announcements/admin-announcements-feed';
import { AdminAnnouncementsFiltersBar } from '@/components/dashboard/announcements/admin-announcements-filters-bar';
import { AdminAnnouncementsList } from '@/components/dashboard/announcements/admin-announcements-list';
import { WardenEventsStatsStrip } from '@/components/dashboard/warden/events/warden-events-stats-strip';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnnouncementsDesk } from '@/hooks/use-announcements-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const DETAIL_BASE = '/warden/events';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenEventsPage() {
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
    hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [view, setView] = useState<'feed' | 'registry'>('feed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filters = useMemo(
    () => ({
      q: search,
      category: 'Events',
      scope: 'All Scopes',
      status: statusFilter,
    }),
    [search, statusFilter],
  );

  const { summary, notices, loadingSummary, loadingList, error, refresh } = useAnnouncementsDesk(filters, {
    pollIntervalMs: 20_000,
    summaryScope: hostelScope,
  });

  const visibleNotices = useMemo(
    () =>
      notices.filter(
        (n) =>
          n.category === 'Events' &&
          (n.scope === 'University-wide' || n.scope.toLowerCase() === hostelScope.toLowerCase()),
      ),
    [notices, hostelScope],
  );

  const listKey = `${search}|${statusFilter}|${view}|${visibleNotices.length}`;

  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;

  const toggleView = (next: 'feed' | 'registry') => {
    if (next === view || reduceMotion || !flipRootRef.current) {
      setView(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-ann-flip]'));
    setView(next);
    requestAnimationFrame(() => {
      Flip.from(state, { duration: 0.42, ease: 'power2.inOut', scale: true, stagger: 0.03, absolute: true });
    });
  };

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-events-reveal]'), {
        opacity: 0,
        y: 14,
        stagger: 0.06,
        duration: 0.4,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <header
        data-events-reveal
        className={cn(
          'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
          'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_52%,var(--card))_0%,var(--card)_60%)] p-5 shadow-sm sm:p-6',
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
              <CalendarRange className="size-3.5" aria-hidden />
              Notices &amp; activities · MOD-17
              {liveLabel ? (
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                  Synced {liveLabel}
                </span>
              ) : null}
            </p>
            <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Events &amp; activities</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Publish and monitor hostel events, sports meets, cultural programs, and acknowledgement-driven activities
              (FR-086 – FR-090).
            </p>
            <Badge variant="outline" className="gap-1.5 font-semibold text-[var(--nestora-forest)]">
              <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {hostelDisplay} + university-wide
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
              onClick={() => setDrawerOpen(true)}
            >
              <Megaphone className="size-4" aria-hidden />
              Post event
            </Button>
            <div
              role="group"
              aria-label="View mode"
              className="inline-flex rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5"
            >
              {(['feed', 'registry'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleView(mode)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    focusRing,
                    view === mode ? 'bg-card text-[var(--nestora-forest)] shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-pressed={view === mode}
                >
                  {mode === 'feed' ? 'Event cards' : 'Registry'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <WardenEventsStatsStrip summary={summary} notices={visibleNotices} loading={loadingSummary || loadingList} />

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <AdminAnnouncementsFiltersBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter="Events"
        onCategoryFilterChange={() => {}}
        scopeFilter={hostelScope}
        onScopeFilterChange={() => {}}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={() => {
          setSearch('');
          setStatusFilter('All Status');
        }}
        showCategoryFilter={false}
        showScopeFilter={false}
      />

      <div ref={flipRootRef}>
        {loadingList && visibleNotices.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Loading events…
          </div>
        ) : (
          <>
            <AdminAnnouncementsFeed
              notices={visibleNotices}
              listKey={listKey}
              hidden={view !== 'feed'}
              detailBasePath={DETAIL_BASE}
            />
            <AdminAnnouncementsList
              rows={visibleNotices}
              hidden={view !== 'registry'}
              detailBasePath={DETAIL_BASE}
            />
          </>
        )}
      </div>

      <AdminAnnouncementsComposeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
