'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Loader2, MapPin, Phone, Plane, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useStudentLeaveDesk } from '@/hooks/use-student-leave-desk';
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
import { submitStudentLeaveApplication, type StudentLeaveRequest } from '@/lib/api/student-leave';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const statusStyles = {
  pending:
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_15%,var(--card))] text-[color-mix(in_oklch,var(--nestora-gold)_90%,#422006)]',
  approved:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)]',
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

function todayIso(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

function LeaveRequestCard({ item, index, reduceMotion }: { item: StudentLeaveRequest; index: number; reduceMotion: boolean | null }) {
  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.32, ease: motionEase }}
      className="rounded-2xl border border-border bg-[color-mix(in_oklch,var(--nestora-cream)_10%,var(--card))] p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[var(--nestora-forest)]">{item.leaveType}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{item.dateRange}</p>
        </div>
        <Badge variant="outline" className={cn('text-xs font-semibold uppercase', statusStyles[item.status])}>
          {item.statusLabel}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{item.statusNote}</p>
      <dl className="mt-4 grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
          <motion.div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Destination</dt>
            <dd className="font-medium text-foreground">{item.destination}</dd>
          </motion.div>
        </div>
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 size-3.5 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
          <motion.div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Emergency contact</dt>
            <dd className="font-medium text-foreground">{item.emergencyContact}</dd>
          </motion.div>
        </div>
      </dl>
      {item.reason && item.reason !== '—' ? (
        <p className="mt-3 rounded-lg bg-muted/30 px-3 py-2 text-sm text-foreground">{item.reason}</p>
      ) : null}
    </motion.li>
  );
}

export function StudentLeavePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { desk, loading, error, isRefreshing, refresh, mergeDesk } = useStudentLeaveDesk();

  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState('Personal');
  const [departureDate, setDepartureDate] = useState(todayIso());
  const [returnDate, setReturnDate] = useState(todayIso());
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-leave-block]'), {
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

  const submitLeave = async () => {
    if (reason.trim().length < 10) {
      toast.error('Please describe your reason in at least 10 characters.');
      return;
    }
    if (destination.trim().length < 2) {
      toast.error('Enter where you are going.');
      return;
    }
    setSubmitting(true);
    const result = await submitStudentLeaveApplication({
      leaveType,
      departureDate,
      expectedReturnDate: returnDate,
      destination: destination.trim(),
      reason: reason.trim(),
      emergencyContact: emergencyContact.trim(),
    });
    setSubmitting(false);
    if (result.desk) {
      mergeDesk(result.desk);
      toast.success('Leave request submitted to your warden.');
      setApplyOpen(false);
      setReason('');
      setDestination('');
    } else {
      toast.error(result.error ?? 'Could not submit leave request.');
    }
  };

  const leaveTypes = desk?.leaveTypes ?? ['Medical', 'Family', 'Academic', 'Emergency', 'Personal'];

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-leave-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <Plane className="size-5 text-[var(--nestora-gold)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Leave Requests</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Apply for hostel leave, track warden decisions, and see your history. Status updates every 20 seconds.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
          </div>
        </div>
        <Button
          type="button"
          className={cn('gap-2 bg-[var(--nestora-forest)] hover:bg-[color-mix(in_oklch,var(--nestora-forest)_88%,black)]', focusRing)}
          onClick={() => setApplyOpen(true)}
          disabled={!desk?.canApply}
        >
          <Plus className="size-4" aria-hidden />
          Apply for leave
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

      {desk && !desk.canApply ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
          You need an active hostel allocation before you can apply for leave. Contact your warden if you believe this is an error.
        </p>
      ) : null}

      {loading && !desk ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading leave requests…
        </div>
      ) : null}

      {desk ? (
        <>
          <motion.section
            data-student-leave-block
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: motionEase }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              { label: 'Total requests', value: desk.summary.total, accent: 'var(--nestora-forest)' },
              { label: 'Pending', value: desk.summary.pending, accent: 'var(--nestora-gold)' },
              { label: 'Approved', value: desk.summary.approved, accent: 'var(--nestora-sage)' },
              { label: 'Rejected', value: desk.summary.rejected, accent: '#c2410c' },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 text-center shadow-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: item.accent }}>
                  {String(item.value).padStart(2, '0')}
                </p>
              </motion.div>
            ))}
          </motion.section>

          <motion.section
            data-student-leave-block
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
            aria-labelledby="leave-list-heading"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="leave-list-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
                <CalendarDays className="size-4 text-[var(--nestora-gold)]" aria-hidden />
                My requests
              </h2>
              {desk.hostelName ? (
                <span className="text-xs text-muted-foreground">{desk.hostelName}</span>
              ) : null}
            </div>

            {desk.requests.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No leave requests yet. Use <strong>Apply for leave</strong> when you need official hostel permission to be away overnight.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {desk.requests.map((item, index) => (
                  <LeaveRequestCard key={item.id} item={item} index={index} reduceMotion={reduceMotion} />
                ))}
              </ul>
            )}
          </motion.section>
        </>
      ) : null}

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-h-[min(92vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--nestora-forest)]">Apply for hostel leave</DialogTitle>
            <DialogDescription>
              Your warden reviews every request. Approved leaves sync with night attendance as on-leave days.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <motion.div className="grid gap-2">
              <Label htmlFor="leave-type">Leave type</Label>
              <Select value={leaveType} onValueChange={(v) => v && setLeaveType(v)}>
                <SelectTrigger id="leave-type" className={focusRing}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div className="grid gap-2">
                <Label htmlFor="departure">Departure date</Label>
                <Input id="departure" type="date" value={departureDate} min={todayIso()} onChange={(e) => setDepartureDate(e.target.value)} />
              </motion.div>
              <motion.div className="grid gap-2">
                <Label htmlFor="return">Expected return</Label>
                <Input
                  id="return"
                  type="date"
                  value={returnDate}
                  min={departureDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </motion.div>
            </div>
            <motion.div className="grid gap-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City or address"
                maxLength={200}
              />
            </motion.div>
            <motion.div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you need leave (min. 10 characters)"
                rows={4}
                maxLength={2000}
              />
            </motion.div>
            <motion.div className="grid gap-2">
              <Label htmlFor="emergency">Emergency contact number</Label>
              <Input
                id="emergency"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 …"
                maxLength={20}
              />
            </motion.div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setApplyOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="button" className="bg-[var(--nestora-forest)]" onClick={() => void submitLeave()} disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Submit request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}