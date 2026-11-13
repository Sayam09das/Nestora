'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminAuditLogsExportDrawer } from '@/components/dashboard/audit-logs/admin-audit-logs-export-drawer';
import { AdminAuditLogsFiltersBar } from '@/components/dashboard/audit-logs/admin-audit-logs-filters-bar';
import { AdminAuditLogsInspectPanel } from '@/components/dashboard/audit-logs/admin-audit-logs-inspect-panel';
import { AdminAuditLogsPageHeader } from '@/components/dashboard/audit-logs/admin-audit-logs-page-header';
import { AdminAuditLogsRegistry } from '@/components/dashboard/audit-logs/admin-audit-logs-registry';
import { AdminAuditLogsStatsStrip } from '@/components/dashboard/audit-logs/admin-audit-logs-stats-strip';
import { AdminAuditLogsTimeline } from '@/components/dashboard/audit-logs/admin-audit-logs-timeline';
import { categorizeAction, severityFor } from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useAuditDesk } from '@/hooks/use-audit-desk';

export function AdminAuditLogsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'timeline' | 'registry'>('timeline');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [severityFilter, setSeverityFilter] = useState('All severity');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const apiFilters = useMemo(
    () => ({
      q: search,
      actionName: actionFilter,
    }),
    [actionFilter, search],
  );

  const { summary, logs, loadingSummary, loadingList, error, refresh, apiOnline } = useAuditDesk(apiFilters);

  const filtered = useMemo(() => {
    return logs.filter((row) => {
      const cat = categorizeAction(row.actionName);
      const sev = severityFor(row.actionName);
      if (categoryFilter !== 'All categories' && cat !== categoryFilter) return false;
      if (severityFilter !== 'All severity' && sev !== severityFilter) return false;
      return true;
    });
  }, [logs, categoryFilter, severityFilter]);

  const selected = filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  useEffect(() => {
    if (!filtered.length) return;
    if (!filtered.some((l) => l.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? '');
    }
  }, [filtered, selectedId]);

  const listKey = `${search}|${categoryFilter}|${severityFilter}|${view}|${logs.length}`;
  const bootLoading = loadingSummary && loadingList && !summary && logs.length === 0;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-aud-reveal]'), {
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
    setCategoryFilter('All categories');
    setSeverityFilter('All severity');
    setActionFilter('');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminAuditLogsPageHeader
        onExport={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
        summary={summary}
        apiOnline={apiOnline}
        loading={loadingSummary}
      />
      {error ? <ErrorBanner error={error} onRetry={refresh} /> : null}
      <AdminAuditLogsStatsStrip summary={summary} loading={loadingSummary} />
      <AdminAuditLogsFiltersBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        onReset={reset}
        onApplyApi={refresh}
        loading={loadingList}
      />
      {bootLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading audit trail…
        </div>
      ) : filtered.length === 0 && !loadingList ? (
        <p className="rounded-xl border border-dashed bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No audit entries match your filters yet.
        </p>
      ) : (
        <div ref={flipRootRef} className="space-y-6">
          <AdminAuditLogsTimeline
            logs={filtered}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            listKey={listKey}
            hidden={view !== 'timeline'}
          />
          <AdminAuditLogsRegistry rows={filtered} hidden={view !== 'registry'} />
          {view === 'timeline' ? <AdminAuditLogsInspectPanel log={selected} /> : null}
        </div>
      )}
      <AdminAuditLogsExportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
      <p className="text-destructive">{error}</p>
      <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
