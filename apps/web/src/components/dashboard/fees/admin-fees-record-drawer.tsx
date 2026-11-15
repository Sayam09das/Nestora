'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { LedgerAccount } from '@/components/dashboard/fees/admin-fees-data';
import { postOfflinePayment } from '@/lib/api/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  preselectAccountId?: string;
  ledgers?: LedgerAccount[];
  onRecorded?: () => void;
};

export function AdminFeesRecordDrawer({ open, onOpenChange, preselectAccountId, ledgers = [], onRecorded }: Props) {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'dd' | 'neft' | 'upi'>('neft');
  const [reference, setReference] = useState('');
  const [receivedOn, setReceivedOn] = useState('');

  useEffect(() => {
    if (!open) {
      setAccountId('');
      setAmount('');
      setMethod('neft');
      setReference('');
      setReceivedOn('');
      return;
    }
    if (preselectAccountId) setAccountId(preselectAccountId);
    setReceivedOn(new Date().toISOString().slice(0, 10));
  }, [open, preselectAccountId]);

  const submit = async () => {
    if (!accountId) {
      toast.error('Select a student ledger.');
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Enter a valid payment amount.');
      return;
    }
    if (!reference.trim()) {
      toast.error('Receipt reference is required for offline entry (FR-076).');
      return;
    }
    if (!receivedOn) {
      toast.error('Payment date is required.');
      return;
    }
    const mode = method.toUpperCase() as 'CASH' | 'DD' | 'NEFT' | 'UPI';
    const result = await postOfflinePayment({
      ledgerId: accountId,
      amount: n,
      paymentMode: mode,
      transactionReference: reference.trim(),
      paymentDate: receivedOn,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Payment ₹${n.toLocaleString('en-IN')} posted · receipt ${result.receiptNumber}`);
    onRecorded?.();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Record offline payment</SheetTitle>
          <SheetDescription>Post cash, DD, NEFT, or UPI receipt against a student ledger with audit reference.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Student ledger</span>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              <option value="">Select student</option>
              {ledgers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.studentName} · {a.room}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Amount (INR)</span>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="12500" className={cn('rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="neft">NEFT / RTGS</option>
              <option value="dd">Demand draft</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Receipt / txn reference</span>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="CHN882190" className={cn('rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Received on</span>
            <Input type="date" value={receivedOn} onChange={(e) => setReceivedOn(e.target.value)} className={cn('rounded-xl', focusRing)} />
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:flex-col sm:space-x-0">
          <Button type="button" className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={() => void submit()}>
            Post payment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
