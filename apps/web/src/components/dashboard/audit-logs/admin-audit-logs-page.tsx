'use client';

import { useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AdminAuditLogsExportDrawer } from '@/components/dashboard/audit-logs/admin-audit-logs-export-drawer';
import { AdminAuditLogsFiltersBar } from '@/components/dashboard/audit-logs/admin-audit-logs-filters-bar';
import { AdminAuditLogsInspectPanel } from '@/components/dashboard/audit-logs/admin-audit-logs-inspect-panel';
import { AdminAuditLogsPageHeader } from '@/components/dashboard/audit-logs/admin-audit-logs-page-header';
import { AdminAuditLogsRegistry } from '@/components/dashboard/audit-logs/admin-audit-logs-registry';
import { AdminAuditLogsStatsStrip } from '@/components/dashboard/audit-logs/admin-audit-logs-stats-strip';
import { AdminAuditLogsTimeline } from '@/components/dashboard/audit-logs/admin-audit-logs-timeline';
import {
  SAMPLE_AUDIT_LOGS,
  categorizeAction,
  severityFor,
} from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { type AuditLogRow, fetchAuditLogs } from '@/lib/api/audit';

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
  const [logs, setLogs] = useState<AuditLogRow[]>(SAMPLE_AUDIT_LOGS);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState(SAMPLE_AUDIT_LOGS[0]?.id ?? '');

  const loadApi = useCallback(async () => {
    setLoading(true);
    setFetchError(undefined);
    const result = await fetchAuditLogs({
      page: 1,
      limit: 50,
      ...(actionFilter.trim() ? { actionName: actionFilter.trim() } : {}),
    });
    setLoading(false);
    if (result.error) {
      setFetchError(result.error);
      setApiOnline(false);
      setLogs(SAMPLE_AUDIT_LOGS);
      return;
    }
    if (result.logs.length > 0) {
      setApiOnline(true);
      setLogs(result.logs);
      const first = result.logs[0];
      if (first) setSelectedId(first.id);
    } else {
      setApiOnline(false);
      setLogs(SAMPLE_AUDIT_LOGS);
    }
  }, [actionFilter]);

  useEffect(() => {
    void loadApi();
    // Initial API probe only; use Refresh API for filtered reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((row) => {
      const cat = categorizeAction(row.actionName);
      const sev = severityFor(row.actionName);
      if (categoryFilter !== 'All categories' && cat !== categoryFilter) return false;
      if (severityFilter !== 'All severity' && sev !== severityFilter) return false;
      if (!q) return true;
      return (
        row.actionName.toLowerCase().includes(q) ||
        row.entityType.toLowerCase().includes(q) ||
        row.entityId.toLowerCase().includes(q) ||
        row.actorRole.toLowerCase().includes(q) ||
        (row.actorUserId ?? '').toLowerCase().includes(q)
      );
    });
  }, [logs, search, categoryFilter, severityFilter]);

  const selected = filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;
  const listKey = `${search}|${categoryFilter}|${severityFilter}|${view}|${logs.length}`;

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
        apiOnline={apiOnline}
      />
      {fetchError && !apiOnline ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-900 dark:text-amber-100" role="status">
          API unavailable — showing sample trail. {fetchError}
        </p>
      ) : null}
      <AdminAuditLogsStatsStrip />
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
        onApplyApi={loadApi}
        loading={loading}
      />
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
      <AdminAuditLogsExportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
