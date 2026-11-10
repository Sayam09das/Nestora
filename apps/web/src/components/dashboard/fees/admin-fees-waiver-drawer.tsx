'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { PENDING_WAIVERS } from '@/components/dashboard/fees/admin-fees-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

export function AdminFeesWaiverDrawer({ open, onOpenChange }: Props) {
  const [waiverId, setWaiverId] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setWaiverId('');
      setDecision('approve');
      setNote('');
    }
  }, [open]);

  const submit = () => {
    if (!waiverId) {
      toast.error('Select a waiver request.');
      return;
    }
    if (!note.trim()) {
      toast.error('Add an approval note for the audit trail (FR-079).');
      return;
    }
    toast.success(`Waiver ${decision === 'approve' ? 'approved' : 'rejected'} (sample).`);
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
              {PENDING_WAIVERS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.student} — {w.reason}
                </option>
              ))}
            </select>
          </label>
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
          <Button type="button" className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={submit}>
            Submit decision
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
