'use client';

import { useCallback, useEffect, useState } from 'react';
import { DoorOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  cancelStudentCheckOutRequest,
  fetchStudentCheckOutDesk,
  submitStudentCheckOutRequest,
  type CheckOutRequestRow,
} from '@/lib/api/checkin-out';

export function StudentCheckoutPanel() {
  const [plannedDate, setPlannedDate] = useState('');
  const [reason, setReason] = useState('');
  const [canRequest, setCanRequest] = useState(false);
  const [outstanding, setOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<CheckOutRequestRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchStudentCheckOutDesk();
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const desk = result.desk;
    setCanRequest(desk?.canRequest ?? false);
    setOutstanding(desk?.outstandingDues ?? 0);
    const open = desk?.requests?.find((r) => r.status === 'PENDING') ?? null;
    setPending(open);
    if (!plannedDate && desk?.canRequest) {
      setPlannedDate(new Date().toISOString().slice(0, 10));
    }
  }, [plannedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!plannedDate) {
      toast.error('Choose a planned checkout date.');
      return;
    }
    setSubmitting(true);
    const result = await submitStudentCheckOutRequest({ plannedDate, reason: reason.trim() || undefined });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Checkout request sent to your warden.');
    setReason('');
    void load();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
        <DoorOpen className="size-4" aria-hidden />
        Planned checkout
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">Request vacating your bed (FR-033). Warden finalizes after dues clearance.</p>
      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" aria-hidden />
          Loading…
        </p>
      ) : pending ? (
        <div className="mt-3 space-y-2 rounded-xl border bg-muted/20 p-3 text-xs">
          <p>
            Pending vacate on <time dateTime={pending.plannedDate}>{pending.plannedDate}</time>
            {pending.accountantCleared ? ' · Accountant cleared' : outstanding > 0 ? ' · Awaiting dues clearance' : ''}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              const result = await cancelStudentCheckOutRequest(pending.id);
              setSubmitting(false);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success('Checkout request cancelled.');
              void load();
            }}
          >
            Cancel request
          </Button>
        </div>
      ) : !canRequest ? (
        <p className="mt-3 text-xs text-muted-foreground">No active allocation or checkout is unavailable.</p>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Outstanding dues: <span className={outstanding > 0 ? 'font-semibold text-destructive' : 'font-semibold text-[var(--nestora-sage)]'}>₹{outstanding.toLocaleString('en-IN')}</span>
          </p>
          <label className="block space-y-1 text-xs">
            <span className="font-medium">Planned date</span>
            <Input type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} className="rounded-xl" />
          </label>
          <label className="block space-y-1 text-xs">
            <span className="font-medium">Reason (optional)</span>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[72px] rounded-xl" placeholder="End of semester, transfer…" />
          </label>
          <Button type="button" size="sm" className="rounded-xl bg-[var(--nestora-forest)]" disabled={submitting} onClick={() => void submit()}>
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Submit request
          </Button>
        </div>
      )}
    </section>
  );
}