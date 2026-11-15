'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { FinancePendingWaiver } from '@/lib/api/finance';
import { postFeeWaiverDecision } from '@/lib/api/finance';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pendingWaivers?: FinancePendingWaiver[];
  onDecided?: () => void;
};

export function AdminFeesWaiverDrawer({ open, onOpenChange, pendingWaivers = [], onDecided }: Props) {
  const [waiverId, setWaiverId] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setWaiverId('');
      setDecision('approve');
      setNote('');
    }
  }, [open]);

  const submit = async () => {
    if (!waiverId) {
      toast.error('Select a waiver request.');
      return;
    }
    if (!note.trim()) {
      toast.error('Add an approval note for the audit trail (FR-079).');
      return;
    }
    setSubmitting(true);
    const result = await postFeeWaiverDecision(waiverId, {
      decision: decision === 'approve' ? 'APPROVED' : 'REJECTED',
      remarks: note.trim(),
    });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Waiver ${decision === 'approve' ? 'approved' : 'rejected'}.`);
    onDecided?.();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Waiver decision</SheetTitle>
          <SheetDescription>Approve or reject concession requests with mandatory notes.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Request</span>
            <select value={waiverId} onChange={(e) => setWaiverId(e.target.value)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              <option value="">Select waiver</option>
              {pendingWaivers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.student} — ₹{w.amount.toLocaleString('en-IN')} — {w.reason.slice(0, 40)}
                </option>
              ))}
            </select>
          </label>
          {pendingWaivers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No pending waivers on the selected ledger desk view.</p>
          ) : null}
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium">Decision</legend>
            <div className="flex gap-2">
              {(['approve', 'reject'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDecision(d)}
                  className={cn(
                    'flex-1 rounded-xl border px-3 py-2 text-sm capitalize',
                    focusRing,
                    decision === d ? 'border-[var(--nestora-forest)] bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--card))]' : '',
                  )}
                  aria-pressed={decision === d}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className={cn('w-full rounded-xl border px-3 py-2 text-sm', focusRing)}
              placeholder="Reason for decision…"
            />
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:flex-col sm:space-x-0">
          <Button type="button" className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} disabled={submitting} onClick={() => void submit()}>
            Submit decision
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}