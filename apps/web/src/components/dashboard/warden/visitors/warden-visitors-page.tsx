'use client';

import { Building2, Loader2, RotateCcw, Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { VISITOR_STATUS_FILTERS } from '@/components/dashboard/visitors/visitor-desk-data';
import { WardenVisitorsDirectory } from '@/components/dashboard/warden/visitors/warden-visitors-directory';
import { WardenVisitorsRegisterSheet } from '@/components/dashboard/warden/visitors/warden-visitors-register-sheet';
import { WardenVisitorsStatsStrip } from '@/components/dashboard/warden/visitors/warden-visitors-stats-strip';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVisitorDesk } from '@/hooks/use-visitor-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import {
  approveVisitor,
  checkInVisitor,
  checkOutVisitor,
  rejectVisitor,
} from '@/lib/api/visitors';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenVisitorsPage() {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter ||
    (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({ q: search, hostel: hostelScope, status: statusFilter }),
    [search, hostelScope, statusFilter],
  );

  const { summary, records, loadingSummary, loadingList, error, refresh, patchRecord } = useVisitorDesk(filters, {
    pollIntervalMs: 20_000,
    summaryHostel: hostelScope,
  });

  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;
  const loading = loadingSummary && loadingList && !summary && records.length === 0;

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
          'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
          'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_48%,var(--card))_0%,var(--card)_62%)] p-5 shadow-sm sm:p-6',
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
              Gate desk · MOD-11
              {liveLabel ? (
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                  Synced {liveLabel}
                </span>
              ) : null}
            </p>
            <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Visitor management</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Pre-approve guests, check visitors in and out, and keep today&apos;s gate log aligned with the warden
              dashboard (FR-060–FR-062).
            </p>
            <Badge variant="outline" className="gap-1.5 font-semibold text-[var(--nestora-forest)]">
              <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {hostelDisplay}
            </Badge>
          </div>
          <Button
            type="button"
            className={cn('h-10 rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
            onClick={() => setRegisterOpen(true)}
          >
            <UserPlus className="size-4" aria-hidden />
            Register visitor
          </Button>
        </div>
      </header>

      <WardenVisitorsStatsStrip summary={summary} loading={loadingSummary} />

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr,auto,auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Visitor, resident, purpose…"
              className={cn('h-10 rounded-xl pl-9', focusRing)}
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn('h-10 rounded-xl border bg-card px-3 text-sm', focusRing)}
          >
            {VISITOR_STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="button" variant="ghost" size="sm" className="h-10 rounded-xl" onClick={() => { setSearch(''); setStatusFilter('All Status'); }}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading visitor desk…
        </div>
      ) : (
        <WardenVisitorsDirectory
          rows={records}
          busyId={busyId}
          onApprove={(id) => void runAction(id, () => approveVisitor(id), 'Visitor approved.')}
          onReject={(id) => void runAction(id, () => rejectVisitor(id), 'Visitor rejected.')}
          onCheckIn={(id) => void runAction(id, () => checkInVisitor(id), 'Visitor checked in.')}
          onCheckOut={(id) => void runAction(id, () => checkOutVisitor(id), 'Visitor checked out.')}
        />
      )}

      <WardenVisitorsRegisterSheet
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        hostel={hostelScope}
        onRegistered={() => void refresh()}
      />
    </div>
  );
}
