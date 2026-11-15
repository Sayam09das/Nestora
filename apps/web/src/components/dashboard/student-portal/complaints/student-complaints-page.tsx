'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, MapPin, MessageSquareWarning, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useStudentComplaintsDesk } from '@/hooks/use-student-complaints-desk';
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
  submitStudentComplaint,
  type StudentComplaintTicket,
} from '@/lib/api/student-complaints';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const statusStyles = {
  open: 'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))]',
  in_progress:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))] text-[var(--nestora-forest)]',
  resolved: 'border-border bg-muted/40 text-muted-foreground',
} as const;

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

function TicketCard({
  ticket,
  index,
  reduceMotion,
}: {
  ticket: StudentComplaintTicket;
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
        <motion.div>
          <p className="font-mono text-[11px] text-muted-foreground">{ticket.ticketNumber}</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--nestora-forest)]">{ticket.title}</p>
        </motion.div>
        <Badge variant="outline" className={cn('text-xs font-semibold', statusStyles[ticket.status])}>
          {ticket.statusLabel}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-2 py-0.5">{ticket.category}</span>
        <span className="rounded-full border border-border px-2 py-0.5">{ticket.suggestedPriority} priority</span>
      </div>
      <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{ticket.location}</span>
      </div>
      <p className="mt-3 text-sm text-foreground">{ticket.description}</p>
      <p className="mt-2 text-xs text-[color-mix(in_oklch,var(--nestora-sage)_75%,var(--muted-foreground))]">
        {ticket.statusNote}
      </p>
      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Updated {ticket.updatedAt}
      </p>
    </motion.li>
  );
}

export function StudentComplaintsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { desk, loading, error, isRefreshing, refresh, mergeDesk } = useStudentComplaintsDesk();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState('Maintenance');
  const [priority, setPriority] = useState('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  useEffect(() => {
    const raw = searchParams.get('category')?.toLowerCase();
    if (raw === 'roommate') setCategory('Roommate');
    if (raw === 'maintenance') setCategory('Maintenance');
  }, [searchParams]);

  useEffect(() => {
    if (desk?.defaultLocation && !location) {
      setLocation(desk.defaultLocation);
    }
  }, [desk?.defaultLocation, location]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-complaints-block]'), {
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

  const submitComplaint = async () => {
    if (title.trim().length < 3) {
      toast.error('Add a short title for your complaint.');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Describe the issue in at least 10 characters.');
      return;
    }
    setSubmitting(true);
    const result = await submitStudentComplaint({
      category,
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || desk?.defaultLocation || 'Hostel',
      suggestedPriority: priority,
    });
    setSubmitting(false);
    if (result.desk) {
      mergeDesk(result.desk);
      toast.success('Complaint submitted. Your warden will review it.');
      setSubmitOpen(false);
      setTitle('');
      setDescription('');
    } else {
      toast.error(result.error ?? 'Could not submit complaint.');
    }
  };

  const categories = desk?.categories ?? ['Maintenance', 'Electrical', 'Plumbing', 'Cleaning', 'Roommate', 'Internet', 'Other'];
  const priorities = desk?.priorities ?? ['Low', 'Medium', 'High'];

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-complaints-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <MessageSquareWarning className="size-5 text-[#c2410c]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Complaints</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Submit maintenance or conduct issues and track resolution. Status refreshes every 20 seconds.
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
          Submit complaint
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
          An active hostel allocation is required before you can raise a complaint.
        </p>
      ) : null}

      {loading && !desk ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading complaints…
        </div>
      ) : null}

      {desk ? (
        <>
          <motion.section
            data-student-complaints-block
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: motionEase }}
          >
            {[
              { label: 'Total', value: desk.summary.total },
              { label: 'Open', value: desk.summary.open },
              { label: 'In progress', value: desk.summary.inProgress },
              { label: 'Resolved', value: desk.summary.resolved },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 text-center shadow-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--nestora-forest)]">
                  {String(item.value).padStart(2, '0')}
                </p>
              </div>
            ))}
          </motion.section>

          <motion.section
            data-student-complaints-block
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
            aria-labelledby="complaints-list-heading"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="complaints-list-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
                My tickets
              </h2>
              {desk.hostelName ? <span className="text-xs text-muted-foreground">{desk.hostelName}</span> : null}
            </div>

            {desk.tickets.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No complaints yet. Use <strong>Submit complaint</strong> for maintenance, cleanliness, internet, or roommate concerns.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {desk.tickets.map((ticket, index) => (
                  <TicketCard key={ticket.id} ticket={ticket} index={index} reduceMotion={reduceMotion} />
                ))}
              </ul>
            )}
          </motion.section>
        </>
      ) : null}

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-h-[min(92vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--nestora-forest)]">Submit a complaint</DialogTitle>
            <DialogDescription>Tickets go to your warden desk. Include clear location details so staff can respond faster.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <motion.div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="complaint-category">Category</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger id="complaint-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="complaint-priority">Urgency</Label>
                <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                  <SelectTrigger id="complaint-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
            <motion.div className="grid gap-2">
              <Label htmlFor="complaint-title">Title</Label>
              <Input id="complaint-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder="Short summary" />
            </motion.div>
            <motion.div className="grid gap-2">
              <Label htmlFor="complaint-location">Location</Label>
              <Input
                id="complaint-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={150}
                placeholder={desk?.defaultLocation ?? 'Room · common area'}
              />
            </motion.div>
            <motion.div className="grid gap-2">
              <Label htmlFor="complaint-description">Description</Label>
              <Textarea
                id="complaint-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="What is wrong, and since when?"
              />
            </motion.div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="button" className="bg-[var(--nestora-forest)]" onClick={() => void submitComplaint()} disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Submit ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}