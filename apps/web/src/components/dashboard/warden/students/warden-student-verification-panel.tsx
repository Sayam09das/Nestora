'use client';

import { useState } from 'react';
import { History, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AuditRow = { at: string; actor: string; action: string; note?: string };

const PLACEHOLDER_AUDIT: AuditRow[] = [
  { at: 'Admin verified', actor: 'University Administrator', action: 'Tier-1 approved', note: 'Eligibility confirmed' },
];

type Props = {
  studentName: string;
  tier2Pending: boolean;
};

export function WardenStudentVerificationPanel({ studentName, tier2Pending }: Props) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const submitApprove = () => {
    toast.success('Warden verified', {
      description: `${studentName}: tier-2 saved when admissions API is connected. Remarks recorded for audit (FR-016).`,
    });
    setApproveOpen(false);
    setRemarks('');
  };

  const submitReject = () => {
    const trimmed = remarks.trim();
    if (trimmed.length < 8) {
      setRejectError('Add hostel suitability remarks (at least 8 characters) before rejecting.');
      return;
    }
    toast.message('Application rejected (draft)', {
      description: `Tier-2 rejection for ${studentName} will sync to admissions workflow.`,
    });
    setRejectOpen(false);
    setRemarks('');
    setRejectError(null);
  };

  return (
    <article className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_30%,var(--border))] bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
            <ShieldCheck className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            Admission verification
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Second-tier warden sign-off with suitability remarks (FR-012). Immutable history (FR-016).
          </p>
        </div>
        {tier2Pending ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="rounded-xl bg-[var(--nestora-forest)]" onClick={() => setApproveOpen(true)}>
              <ShieldCheck className="size-4" aria-hidden />
              Approve tier-2
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setRejectOpen(true)}>
              <XCircle className="size-4" aria-hidden />
              Reject
            </Button>
          </div>
        ) : (
          <p className="text-xs font-semibold text-[var(--nestora-sage)]">No pending warden action</p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-3">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <History className="size-3.5" aria-hidden />
          Verification history
        </p>
        <ul className="mt-2 space-y-2">
          {PLACEHOLDER_AUDIT.map((row, i) => (
            <li key={i} className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs">
              <p className="font-semibold text-foreground">{row.action}</p>
              <p className="text-muted-foreground">
                {row.actor} · {row.at}
                {row.note ? ` — ${row.note}` : ''}
              </p>
            </li>
          ))}
          {tier2Pending ? (
            <li className="rounded-lg border border-dashed border-[var(--nestora-gold)] bg-[color-mix(in_oklch,var(--nestora-gold)_8%,var(--card))] px-3 py-2 text-xs text-muted-foreground">
              Warden tier-2 decision pending your review.
            </li>
          ) : null}
        </ul>
      </div>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve tier-2 verification</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm {studentName} is suitable for this hostel. Optional remarks are stored in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Hostel suitability remarks (optional)</span>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Gender wing match, medical notes reviewed…"
              className="min-h-[88px] rounded-xl"
            />
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className={cn('rounded-xl bg-[var(--nestora-forest)]', focusRing)} onClick={submitApprove}>
              Confirm approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) {
            setRejectError(null);
            setRemarks('');
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject tier-2 verification</AlertDialogTitle>
            <AlertDialogDescription>
              Provide clear hostel suitability reasons. The student may resubmit after corrections (FR-014).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Rejection remarks (required)</span>
            <Textarea
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                setRejectError(null);
              }}
              className="min-h-[88px] rounded-xl"
              aria-invalid={rejectError != null}
            />
            {rejectError ? <span className="text-xs text-destructive">{rejectError}</span> : null}
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn('rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90', focusRing)}
              onClick={(e) => {
                e.preventDefault();
                submitReject();
              }}
            >
              Submit rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
