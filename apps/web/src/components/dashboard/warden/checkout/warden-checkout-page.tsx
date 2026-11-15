'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DoorOpen, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  finalizeWardenCheckOut,
  fetchWardenCheckOutQueue,
  rejectWardenCheckOut,
  type CheckOutRequestRow,
} from '@/lib/api/checkin-out';
type InspectionCondition = 'INTACT' | 'DAMAGED' | 'MISSING';
type InspectionRow = { itemName: string; condition: InspectionCondition; damageFee?: number };

const DEFAULT_ITEM_NAMES = ['Room keys', 'Mattress', 'Furniture', 'Electrical fixtures'];

function defaultInspections(): InspectionRow[] {
  return DEFAULT_ITEM_NAMES.slice(0, 3).map((itemName) => ({ itemName, condition: 'INTACT' as const }));
}

export function WardenCheckoutPage() {
  const [requests, setRequests] = useState<CheckOutRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [keysReturned, setKeysReturned] = useState<Record<string, boolean>>({});
  const [inspections, setInspections] = useState<Record<string, InspectionRow[]>>({});
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<CheckOutRequestRow | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [finalizeRemarks, setFinalizeRemarks] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchWardenCheckOutQueue();
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const list = result.requests ?? [];
    setRequests(list);
    setInspections((prev) => {
      const next = { ...prev };
      for (const row of list) {
        if (!next[row.id]?.length) next[row.id] = defaultInspections();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateInspection = (requestId: string, index: number, patch: Partial<InspectionRow>) => {
    setInspections((prev) => {
      const rows = [...(prev[requestId] ?? defaultInspections())];
      const current = rows[index];
      if (!current) return prev;
      const next: InspectionRow = { ...current, ...patch, itemName: patch.itemName ?? current.itemName, condition: patch.condition ?? current.condition };
      if (next.condition !== 'DAMAGED') {
        next.damageFee = undefined;
      }
      rows[index] = next;
      return { ...prev, [requestId]: rows };
    });
  };

  const addInspectionRow = (requestId: string) => {
    setInspections((prev) => {
      const rows = [...(prev[requestId] ?? defaultInspections())];
      if (rows.length >= 20) return prev;
      rows.push({ itemName: 'Inventory item', condition: 'INTACT' });
      return { ...prev, [requestId]: rows };
    });
  };

  const removeInspectionRow = (requestId: string, index: number) => {
    setInspections((prev) => {
      const rows = [...(prev[requestId] ?? defaultInspections())];
      if (rows.length <= 1) return prev;
      rows.splice(index, 1);
      return { ...prev, [requestId]: rows };
    });
  };

  const finalize = async (row: CheckOutRequestRow) => {
    if (row.outstandingDues > 0 && !row.accountantCleared) {
      toast.error(`Accountant clearance or zero dues required (₹${row.outstandingDues.toLocaleString('en-IN')} outstanding).`);
      return;
    }
    const rows = inspections[row.id] ?? defaultInspections();
    if (rows.some((r) => !r.itemName.trim())) {
      toast.error('Each inspection row needs an item name.');
      return;
    }
    setSubmittingId(row.id);
    const result = await finalizeWardenCheckOut(row.id, {
      keysReturned: keysReturned[row.id] ?? false,
      remarks: finalizeRemarks[row.id]?.trim() || undefined,
      inspections: rows.map((r) => ({
        itemName: r.itemName.trim(),
        condition: r.condition,
        damageFee: r.condition === 'DAMAGED' ? r.damageFee : undefined,
      })),
    });
    setSubmittingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${row.studentName} checked out — bed released.`);
    void load();
  };

  const openReject = (row: CheckOutRequestRow) => {
    setRejectTarget(row);
    setRejectRemarks('');
    setRejectOpen(true);
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (rejectRemarks.trim().length < 8) {
      toast.error('Rejection remarks must be at least 8 characters.');
      return;
    }
    setSubmittingId(rejectTarget.id);
    const result = await rejectWardenCheckOut(rejectTarget.id, rejectRemarks.trim());
    setSubmittingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.message('Checkout request rejected');
    setRejectOpen(false);
    setRejectTarget(null);
    void load();
  };

  const extraItems = useMemo(() => DEFAULT_ITEM_NAMES.filter((n) => !DEFAULT_ITEM_NAMES.slice(0, 3).includes(n)), []);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-[var(--nestora-forest)]">
          <DoorOpen className="size-5 text-[var(--nestora-gold)]" aria-hidden />
          Planned checkouts
        </h1>
        <p className="text-sm text-muted-foreground">MOD-06 queue · record room inspection before finalize</p>
      </header>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading queue…
        </p>
      ) : requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No pending checkout requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((row) => {
            const rows = inspections[row.id] ?? defaultInspections();
            return (
              <li key={row.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{row.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.regNo} · {row.hostel} · {row.room} bed {row.bed}
                    </p>
                    <p className="mt-1 text-sm">
                      Planned: <span className="font-medium">{row.plannedDate}</span>
                      {row.reason ? ` — ${row.reason}` : ''}
                    </p>
                    <p className={row.outstandingDues > 0 ? 'mt-1 text-xs font-semibold text-destructive' : 'mt-1 text-xs text-[var(--nestora-sage)]'}>
                      Outstanding: ₹{row.outstandingDues.toLocaleString('en-IN')}
                      {row.accountantCleared ? ' · Accountant cleared' : ''}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={keysReturned[row.id] ?? false}
                      onCheckedChange={(v) => setKeysReturned((prev) => ({ ...prev, [row.id]: Boolean(v) }))}
                    />
                    Keys returned
                  </label>
                </div>

                <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Room inspection</h3>
                <ul className="mt-2 space-y-2">
                  {rows.map((item, index) => (
                    <li key={`${row.id}-${index}`} className="flex flex-wrap items-end gap-2 rounded-xl border bg-muted/15 p-2">
                      <label className="min-w-[8rem] flex-1 space-y-0.5 text-[11px]">
                        <span className="font-medium">Item</span>
                        <Input
                          value={item.itemName}
                          list={`checkout-items-${row.id}`}
                          onChange={(e) => updateInspection(row.id, index, { itemName: e.target.value })}
                          className="h-8 rounded-lg text-xs"
                        />
                      </label>
                      <label className="space-y-0.5 text-[11px]">
                        <span className="font-medium">Condition</span>
                        <select
                          value={item.condition}
                          onChange={(e) => updateInspection(row.id, index, { condition: e.target.value as InspectionCondition })}
                          className="h-8 rounded-lg border px-2 text-xs"
                        >
                          <option value="INTACT">Intact</option>
                          <option value="DAMAGED">Damaged</option>
                          <option value="MISSING">Missing</option>
                        </select>
                      </label>
                      {item.condition === 'DAMAGED' ? (
                        <label className="space-y-0.5 text-[11px]">
                          <span className="font-medium">Fee (₹)</span>
                          <Input
                            type="number"
                            min={0}
                            value={item.damageFee ?? ''}
                            onChange={(e) =>
                              updateInspection(row.id, index, {
                                damageFee: e.target.value === '' ? undefined : Number(e.target.value),
                              })
                            }
                            className="h-8 w-24 rounded-lg tabular-nums text-xs"
                          />
                        </label>
                      ) : null}
                      <Button type="button" size="icon-sm" variant="ghost" className="rounded-lg" aria-label="Remove row" onClick={() => removeInspectionRow(row.id, index)}>
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
                <datalist id={`checkout-items-${row.id}`}>
                  {[...DEFAULT_ITEM_NAMES, ...extraItems].map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                <Button type="button" size="sm" variant="outline" className="mt-2 rounded-xl" onClick={() => addInspectionRow(row.id)}>
                  <Plus className="size-3.5" aria-hidden />
                  Add item
                </Button>

                <label className="mt-3 block space-y-1 text-[11px]">
                  <span className="font-medium text-muted-foreground">Finalize remarks (optional)</span>
                  <Textarea
                    value={finalizeRemarks[row.id] ?? ''}
                    onChange={(e) => setFinalizeRemarks((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    rows={2}
                    className="rounded-xl text-xs"
                    placeholder="Handover notes for audit…"
                  />
                </label>

                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-3">
                  <Button type="button" size="sm" variant="outline" className="rounded-xl" disabled={submittingId === row.id} onClick={() => openReject(row)}>
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl bg-[var(--nestora-forest)]"
                    disabled={submittingId === row.id}
                    onClick={() => void finalize(row)}
                  >
                    {submittingId === row.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                    Finalize checkout
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject checkout request</DialogTitle>
            <DialogDescription>
              {rejectTarget ? `Reason for rejecting ${rejectTarget.studentName}'s vacate request (audit logged).` : ''}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            rows={4}
            placeholder="Explain why checkout cannot proceed…"
            className="rounded-xl"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-xl bg-destructive text-white" disabled={submittingId != null} onClick={() => void submitReject()}>
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}