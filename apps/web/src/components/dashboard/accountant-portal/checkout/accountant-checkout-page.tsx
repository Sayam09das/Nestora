'use client';

import { Loader2, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchAccountantCheckOutQueue,
  postAccountantCheckOutClearance,
  type CheckOutRequestRow,
} from '@/lib/api/checkin-out';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type RowDraft = { affirm: boolean; remarks: string };

export function AccountantCheckoutPage() {
  const [rows, setRows] = useState<CheckOutRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAccountantCheckOutQueue();
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const list = (result.requests ?? []).filter((r) => r.outstandingDues > 0 && !r.accountantCleared);
    setRows(list);
    setDrafts((prev) => {
      const next = { ...prev };
      for (const row of list) {
        if (!next[row.id]) next[row.id] = { affirm: false, remarks: '' };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateDraft = (id: string, patch: Partial<RowDraft>) => {
    setDrafts((prev) => ({ ...prev, [id]: { affirm: false, remarks: '', ...prev[id], ...patch } }));
  };

  const clearRequest = async (row: CheckOutRequestRow) => {
    const draft = drafts[row.id] ?? { affirm: false, remarks: '' };
    if (!draft.affirm) {
      toast.error('Confirm dues are cleared or waived before recording clearance.');
      return;
    }
    setActingId(row.id);
    const result = await postAccountantCheckOutClearance(row.id, {
      affirmDuesCleared: true,
      remarks: draft.remarks.trim() || undefined,
    });
    setActingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Clearance recorded for ${row.studentName}. Warden may finalize checkout.`);
    void load();
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border bg-card p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-[var(--nestora-forest)]">
          <ShieldCheck className="size-5" aria-hidden />
          Vacate clearance (MOD-06)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pending checkouts with outstanding dues need accountant clearance before the warden can finalize vacate.
        </p>
      </header>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading queue…
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No pending vacate requests need clearance.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const draft = drafts[row.id] ?? { affirm: false, remarks: '' };
            return (
              <li key={row.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{row.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.regNo} · {row.hostel} · {row.room} · {row.bed}
                    </p>
                    <p className="mt-1 text-xs">
                      Planned: <time dateTime={row.plannedDate}>{row.plannedDate}</time>
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-[var(--nestora-gold)]">
                    ₹{row.outstandingDues.toLocaleString('en-IN')} due
                  </p>
                </div>
                <div className="mt-4 space-y-3 border-t pt-4">
                  <label className="flex items-center gap-2 text-xs font-medium">
                    <Checkbox
                      checked={draft.affirm}
                      onCheckedChange={(v) => updateDraft(row.id, { affirm: Boolean(v) })}
                      aria-label={`Affirm dues cleared for ${row.studentName}`}
                    />
                    Dues settled or formally waived
                  </label>
                  <label className="block space-y-1 text-xs">
                    <span className="font-medium">Clearance note (optional)</span>
                    <Textarea
                      value={draft.remarks}
                      onChange={(e) => updateDraft(row.id, { remarks: e.target.value })}
                      className="min-h-[56px] rounded-xl"
                    />
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
                    disabled={actingId === row.id}
                    onClick={() => void clearRequest(row)}
                  >
                    {actingId === row.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                    Record clearance
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}