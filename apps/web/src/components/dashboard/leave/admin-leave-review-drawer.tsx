'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { type LeaveRecord } from '@/components/dashboard/leave/admin-leave-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  record: LeaveRecord | null;
  onDecided: (id: string, decision: 'Approved' | 'Rejected', feedback: string) => void;
};

export function AdminLeaveReviewDrawer({ open, onOpenChange, record, onDecided }: Props) {
  const [feedback, setFeedback] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    if (!open) {
      setFeedback('');
      setMode('approve');
    }
  }, [open]);

  if (!record) return null;

  const approve = () => {
    onDecided(record.id, 'Approved', feedback.trim() || 'Approved — gate pass ready.');
    toast.success(`${record.leaveRef} approved. Bed remains occupied (sample).`);
    onOpenChange(false);
  };

  const reject = () => {
    if (!feedback.trim()) {
      toast.error('Rejection requires warden feedback (FR-039).');
      return;
    }
    onDecided(record.id, 'Rejected', feedback.trim());
    toast.message(`${record.leaveRef} rejected.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Warden decision</SheetTitle>
          <SheetDescription>
            {record.studentName} · {record.leaveRef}
            {record.status === 'Extension Pending' ? ' · extension request' : ''}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <div className="rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-3 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Departure:</span> {record.departureDate}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">Return:</span> {record.expectedReturnDate}
            </p>
            <p className="mt-1">{record.reason}</p>
          </div>
          <DecisionToggle mode={mode} onModeChange={setMode} />
          <label className="block space-y-1">
            <span className="text-xs font-medium">{mode === 'reject' ? 'Rejection feedback (required)' : 'Notes for gate desk (optional)'}</span>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className={cn('rounded-xl', focusRing)}
              placeholder={mode === 'reject' ? 'Explain why leave cannot be granted…' : 'Keys deposit, travel window, etc.'}
            />
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:justify-between">
          <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === 'approve' ? (
            <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={approve}>
              Approve leave
            </Button>
          ) : (
            <Button type="button" variant="destructive" className={cn('rounded-xl', focusRing)} onClick={reject}>
              Reject with feedback
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DecisionToggle({ mode, onModeChange }: { mode: 'approve' | 'reject'; onModeChange: (m: 'approve' | 'reject') => void }) {
  const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';
  return (
    <div role="group" aria-label="Decision" className="inline-flex rounded-xl border p-0.5">
      {(['approve', 'reject'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onModeChange(m)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium capitalize',
            focusRing,
            mode === m ? 'bg-[var(--nestora-forest)] text-white' : 'text-muted-foreground',
          )}
          aria-pressed={mode === m}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
