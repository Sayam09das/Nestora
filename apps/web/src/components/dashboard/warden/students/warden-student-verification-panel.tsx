'use client';

import { useState } from 'react';
import { History, Loader2, ShieldCheck, XCircle } from 'lucide-react';
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
import type { AdmissionVerificationRow } from '@/lib/api/admissions';
import { postAdmissionTier2Verification } from '@/lib/api/admissions';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function formatVerifiedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

type Props = {
  studentName: string;
  applicationId: string | null;
  tier2Pending: boolean;
  verificationHistory: AdmissionVerificationRow[];
  onUpdated: () => void;
};

export function WardenStudentVerificationPanel({
  studentName,
  applicationId,
  tier2Pending,
  verificationHistory,
  onUpdated,
}: Props) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const runDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!applicationId) {
      toast.error('No admission application on file for this student.');
      return;
    }
    setSubmitting(true);
    const result = await postAdmissionTier2Verification(applicationId, {
      decision,
      comments: remarks.trim() || undefined,
    });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (decision === 'APPROVED') {
      toast.success('Warden tier-2 approved', {
        description: `${studentName} is fully approved for allocation (MOD-04).`,
      });
      setApproveOpen(false);
    } else {
      toast.message('Application rejected', {
        description: `Tier-2 rejection recorded for ${studentName}.`,
      });
      setRejectOpen(false);
      setRejectError(null);
    }
    setRemarks('');
    onUpdated();
  };

  const submitApprove = () => void runDecision('APPROVED');

  const submitReject = () => {
    const trimmed = remarks.trim();
    if (trimmed.length < 8) {
      setRejectError('Add hostel suitability remarks (at least 8 characters) before rejecting.');
      return;
    }
    void runDecision('REJECTED');
  };

  const canAct = tier2Pending && Boolean(applicationId);

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
        {canAct ? (
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
          <p className="text-xs font-semibold text-[var(--nestora-sage)]">
            {tier2Pending && !applicationId ? 'Application loading…' : 'No pending warden action'}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-3">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <History className="size-3.5" aria-hidden />
          Verification history
        </p>
        <ul className="mt-2 space-y-2">
          {verificationHistory.length === 0 ? (
            <li className="text-xs text-muted-foreground">No verification events yet.</li>
          ) : (
            verificationHistory.map((row) => (
              <li key={row.id} className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs">
                <p className="font-semibold text-foreground">
                  {row.tierLabel} · {row.decision === 'APPROVED' ? 'Approved' : 'Rejected'}
                </p>
                <p className="text-muted-foreground">
                  {row.actorName} · {formatVerifiedAt(row.verifiedAt)}
                  {row.comments ? ` — ${row.comments}` : ''}
                </p>
              </li>
            ))
          )}
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
            <AlertDialogCancel className="rounded-xl" disabled={submitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn('rounded-xl bg-[var(--nestora-forest)]', focusRing)}
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                void submitApprove();
              }}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
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
            <AlertDialogCancel className="rounded-xl" disabled={submitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn('rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90', focusRing)}
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                submitReject();
              }}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Submit rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}