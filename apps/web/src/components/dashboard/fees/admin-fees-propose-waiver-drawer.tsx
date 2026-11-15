'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { LedgerAccount } from '@/components/dashboard/fees/admin-fees-data';
import { postProposeFeeWaiver } from '@/lib/api/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  account: LedgerAccount | null;
  onSubmitted?: () => void;
};

export function AdminFeesProposeWaiverDrawer({ open, onOpenChange, account, onSubmitted }: Props) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setAmount('');
      setReason('');
    }
  }, [open]);

  const submit = async () => {
    if (!account) {
      toast.error('Select a ledger first.');
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Enter a valid waiver amount.');
      return;
    }
    if (reason.trim().length < 8) {
      toast.error('Reason must be at least 8 characters (FR-080).');
      return;
    }
    setSubmitting(true);
    const result = await postProposeFeeWaiver({
      ledgerId: account.id,
      amount: parsed,
      reason: reason.trim(),
    });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Waiver submitted for administrator approval.');
    onSubmitted?.();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Propose fee waiver</SheetTitle>
          <SheetDescription>
            {account ? `${account.studentName} · outstanding ${account.outstanding.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}` : 'Select a student ledger.'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Amount (INR)</span>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn('rounded-xl tabular-nums', focusRing)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Reason</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className={cn('w-full rounded-xl border px-3 py-2 text-sm', focusRing)}
              placeholder="Document why this concession is warranted…"
            />
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
            disabled={submitting || !account}
            onClick={() => void submit()}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Submit for approval
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}