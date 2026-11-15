'use client';

import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOutingDesk } from '@/hooks/use-outing-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

export function WardenOutingsPage() {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope = hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('Pending Review');
  const filters = useMemo(() => ({ q, hostel: hostelScope, status }), [q, hostelScope, status]);
  const { summary, applications, loadingList, loadingSummary, error, decide } = useOutingDesk(filters);
  const [busyId, setBusyId] = useState<string | null>(null);

  const onDecision = async (outingId: string, decision: 'Approved' | 'Rejected') => {
    let feedback: string | undefined;
    if (decision === 'Rejected') {
      feedback = window.prompt('Rejection reason (required):')?.trim();
      if (!feedback) {
        toast.message('Rejection requires feedback.');
        return;
      }
    }
    setBusyId(outingId);
    const result = await decide(outingId, decision, feedback);
    setBusyId(null);
    if (result.ok) toast.success(decision === 'Approved' ? 'Outing approved.' : 'Outing rejected.');
    else toast.error(result.error);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Outing approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Same-day outing queue for {hostelDisplay} (MOD-08).</p>
      </header>

      {summary ? (
        <dl className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-3">
            <dt className="text-xs text-muted-foreground">Pending</dt>
            <dd className="text-lg font-semibold">{summary.pendingReview}</dd>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <dt className="text-xs text-muted-foreground">Approved today</dt>
            <dd className="text-lg font-semibold">{summary.approvedToday}</dd>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <dt className="text-xs text-muted-foreground">Exceptional pending</dt>
            <dd className="text-lg font-semibold">{summary.exceptionalPending}</dd>
          </div>
        </dl>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student or destination…" className="max-w-xs" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option>Pending Review</option>
          <option>All Status</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {loadingSummary || loadingList ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Syncing queue…
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <ul className="space-y-3">
        {applications.map((row) => (
          <li key={row.id} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  {row.studentName} · {row.outingRef}
                </p>
                <p className="text-sm text-muted-foreground">
                  {row.outingDate} {row.departureTime}–{row.expectedReturnTime} · {row.destination}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.hostel} · {row.roomBed}
                  {row.isExceptional ? ' · Exceptional' : ''}
                </p>
              </div>
              <span className="text-xs font-semibold uppercase">{row.status}</span>
            </div>
            {row.status === 'Pending Review' ? (
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={busyId === row.id}
                  onClick={() => void onDecision(row.id, 'Approved')}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busyId === row.id}
                  onClick={() => void onDecision(row.id, 'Rejected')}
                >
                  Reject
                </Button>
              </div>
            ) : row.gatePassToken ? (
              <p className="mt-2 text-xs text-muted-foreground">Gate pass: {row.gatePassToken}</p>
            ) : null}
          </li>
        ))}
        {!loadingList && applications.length === 0 ? (
          <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No outings in this view.</li>
        ) : null}
      </ul>
    </div>
  );
}