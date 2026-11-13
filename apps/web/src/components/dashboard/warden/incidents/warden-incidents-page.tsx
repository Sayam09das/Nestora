'use client';

import { Building2, Loader2, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  INCIDENT_SEVERITY_FILTERS,
  INCIDENT_STATUS_FILTERS,
  INCIDENT_TYPE_FILTERS,
} from '@/components/dashboard/incidents/incident-desk-data';
import { WardenIncidentsDirectory } from '@/components/dashboard/warden/incidents/warden-incidents-directory';
import { WardenIncidentsStatsStrip } from '@/components/dashboard/warden/incidents/warden-incidents-stats-strip';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIncidentDesk } from '@/hooks/use-incident-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { acknowledgeIncident, markIncidentInProgress } from '@/lib/api/incidents';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenIncidentsPage() {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelScope,
      type: typeFilter,
      severity: severityFilter,
      status: statusFilter,
    }),
    [search, hostelScope, typeFilter, severityFilter, statusFilter],
  );

  const { summary, records, loadingSummary, loadingList, error, refresh, patchRecord } = useIncidentDesk(filters, {
    pollIntervalMs: 20_000,
    summaryHostel: hostelScope,
  });

  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;

  const runAction = async (
    id: string,
    action: () => Promise<{ record?: { id: string }; error?: string }>,
    success: string,
  ) => {
    setBusyId(id);
    const result = await action();
    setBusyId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.record) {
      patchRecord(id, result.record as never);
    }
    toast.success(success);
    void refresh();
  };

  return (
    <div className="space-y-6 pb-6">
      <header
        className={cn(
          'rounded-2xl border border-[color-mix(in_oklch,var(--destructive)_22%,var(--border))]',
          'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--destructive)_6%,var(--card))_0%,var(--card)_58%)] p-5 shadow-sm sm:p-6',
        )}
      >
        <div className="space-y-2">
          <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            Emergency &amp; incidents · MOD-16
            {liveLabel ? (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                Synced {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Incident reports</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Acknowledge emergencies, adjust official severity, log on-site actions, and close incidents with an audit
            trail (FR-108 – FR-115).
          </p>
          <Badge variant="outline" className="gap-1.5 font-semibold text-[var(--nestora-forest)]">
            <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            {hostelDisplay}
          </Badge>
        </div>
      </header>

      <WardenIncidentsStatsStrip summary={summary} loading={loadingSummary} />

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr,auto,auto,auto,auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ref, title, location, reporter…"
              className={cn('h-10 rounded-xl pl-9', focusRing)}
            />
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={cn('h-10 rounded-xl border bg-card px-3 text-sm', focusRing)}
          >
            {INCIDENT_TYPE_FILTERS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className={cn('h-10 rounded-xl border bg-card px-3 text-sm', focusRing)}
          >
            {INCIDENT_SEVERITY_FILTERS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn('h-10 rounded-xl border bg-card px-3 text-sm', focusRing)}
          >
            {INCIDENT_STATUS_FILTERS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 rounded-xl"
            onClick={() => {
              setSearch('');
              setTypeFilter('All Types');
              setSeverityFilter('All Severities');
              setStatusFilter('All Status');
            }}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </section>

      {loadingList && records.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading incident desk…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          No incidents match these filters for {hostelDisplay}.
        </div>
      ) : (
        <WardenIncidentsDirectory
          rows={records}
          busyId={busyId}
          onAcknowledge={(id) =>
            void runAction(id, () => acknowledgeIncident(id), 'Incident acknowledged.')
          }
          onInProgress={(id) =>
            void runAction(
              id,
              () => markIncidentInProgress(id, 'Warden team dispatched to location.'),
              'Response started.',
            )
          }
        />
      )}
    </div>
  );
}
