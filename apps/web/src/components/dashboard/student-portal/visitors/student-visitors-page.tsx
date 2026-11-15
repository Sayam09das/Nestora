'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { IdCard, Loader2, Plus, RefreshCw, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useStudentVisitorsDesk } from '@/hooks/use-student-visitors-desk';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  submitStudentVisitorRequest,
  type StudentVisitorRequest,
} from '@/lib/api/student-visitors';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const statusStyles = {
  pending: 'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))]',
  approved: 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)]',
  inside: 'border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_8%,var(--card))] text-[var(--nestora-forest)]',
  checked_out: 'border-border bg-muted/40 text-muted-foreground',
  rejected: 'border-[color-mix(in_oklch,#dc2626_25%,var(--border))] bg-[color-mix(in_oklch,#dc2626_10%,var(--card))] text-[#991b1b]',
} as const;

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

function VisitorCard({
  item,
  index,
  reduceMotion,
}: {
  item: StudentVisitorRequest;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.32, ease: motionEase }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground">{item.visitorRef}</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--nestora-forest)]">{item.visitorName}</p>
        </div>
        <Badge variant="outline" className={cn('text-xs font-semibold', statusStyles[item.status])}>
          {item.statusLabel}
        </Badge>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Phone</dt>
          <dd>{item.visitorPhone}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-muted-foreground">ID ({item.idProofType})</dt>
          <dd className="font-mono">{item.idProofMasked}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-foreground">{item.purpose}</p>
      <p className="mt-2 text-xs text-muted-foreground">{item.statusNote}</p>
      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Submitted {item.submittedAt}
        {item.checkInTime ? ` · In ${item.checkInTime}` : ''}
        {item.checkOutTime ? ` · Out ${item.checkOutTime}` : ''}
      </p>
    </motion.li>
  );
}

export function StudentVisitorsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { desk, loading, error, isRefreshing, refresh, mergeDesk } = useStudentVisitorsDesk();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [purpose, setPurpose] = useState('');

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-visitors-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, desk?.summary.total] },
  );

  const submitVisitor = async () => {
    if (visitorName.trim().length < 2) {
      toast.error('Enter visitor full name.');
      return;
    }
    if (purpose.trim().length < 3) {
      toast.error('Describe the visit purpose.');
      return;
    }
    setSubmitting(true);
    const result = await submitStudentVisitorRequest({
      visitorName: visitorName.trim(),
      visitorPhone: visitorPhone.trim(),
      idProofType,
      idProofNumber: idProofNumber.trim(),
      purpose: purpose.trim(),
    });
    setSubmitting(false);
    if (result.desk) {
      mergeDesk(result.desk);
      toast.success('Visitor request sent for warden approval.');
      setSubmitOpen(false);
      setVisitorName('');
      setVisitorPhone('');
      setIdProofNumber('');
      setPurpose('');
    } else {
      toast.error(result.error ?? 'Could not submit visitor request.');
    }
  };

  const idProofTypes = desk?.idProofTypes ?? ['Aadhaar', 'Driving License', 'Voter ID', 'Passport', 'Other'];

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-visitors-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <UserRound className="size-5 text-[var(--nestora-sage)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Visitor Requests</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Pre-register guests for gate approval and check-in. Status syncs with security every 20 seconds.
          </p>
          <motion.div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card px-3 py-1 text-xs font-medium text-[var(--nestora-forest)]">
              Live · {syncLabel}
              {isRefreshing ? ' · refreshing' : ''}
            </span>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refresh()} disabled={loading}>
              {loading || isRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Refresh
            </Button>
            <Link href="/student" className={cn('text-sm font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
              Back to dashboard
            </Link>
          </motion.div>
        </div>
        <Button
          type="button"
          className={cn('gap-2 bg-[var(--nestora-forest)]', focusRing)}
          onClick={() => setSubmitOpen(true)}
          disabled={!desk?.canSubmit}
        >
          <Plus className="size-4" aria-hidden />
          Request visitor
        </Button>
      </header>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      {desk && !desk.canSubmit ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
          You need an active bed allocation before pre-registering visitors.
        </p>
      ) : null}

      {loading && !desk ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading visitor requests…
        </div>
      ) : null}

      {desk ? (
        <>
          <motion.section
            data-student-visitors-block
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: motionEase }}
          >
            {[
              { label: 'Total', value: desk.summary.total },
              { label: 'Pending', value: desk.summary.pending },
              { label: 'Approved', value: desk.summary.approved },
              { label: 'Inside', value: desk.summary.inside },
              { label: 'Checked out', value: desk.summary.checkedOut },
              { label: 'Rejected', value: desk.summary.rejected },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-3 text-center shadow-sm sm:p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)] sm:text-3xl">
                  {String(item.value).padStart(2, '0')}
                </p>
              </motion.div>
            ))}
          </motion.section>

          <motion.section
            data-student-visitors-block
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">My visitor passes</h2>
              {desk.hostelName ? <span className="text-xs text-muted-foreground">{desk.hostelName}</span> : null}
            </div>

            {desk.requests.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No visitor requests yet. Register guests ahead of time so security can verify ID at the gate.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {desk.requests.map((item, index) => (
                  <VisitorCard key={item.id} item={item} index={index} reduceMotion={reduceMotion} />
                ))}
              </ul>
            )}
          </motion.section>
        </>
      ) : null}

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-h-[min(92vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--nestora-forest)]">Pre-register a visitor</DialogTitle>
            <DialogDescription>
              Details are shared with warden and gate staff. Visitors must carry the original ID shown below.
            </DialogDescription>
          </DialogHeader>
          <motion.div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="visitor-name">Visitor name</Label>
              <Input id="visitor-name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} maxLength={150} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visitor-phone">Visitor phone</Label>
              <Input id="visitor-phone" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} maxLength={20} placeholder="+91 …" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="id-proof-type">ID proof type</Label>
                <Select value={idProofType} onValueChange={(v) => v && setIdProofType(v)}>
                  <SelectTrigger id="id-proof-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {idProofTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="id-proof-number" className="flex items-center gap-1">
                  <IdCard className="size-3.5" aria-hidden />
                  ID number
                </Label>
                <Input id="id-proof-number" value={idProofNumber} onChange={(e) => setIdProofNumber(e.target.value)} maxLength={100} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visitor-purpose">Purpose of visit</Label>
              <Textarea id="visitor-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={4} maxLength={500} placeholder="Family visit, document drop-off, etc." />
            </div>
          </motion.div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="button" className="bg-[var(--nestora-forest)]" onClick={() => void submitVisitor()} disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Submit request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}