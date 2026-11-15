'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, LifeBuoy, Loader2, Mail, MessageSquarePlus, Phone, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useStudentHelpDesk } from '@/hooks/use-student-help-desk';
import { submitStudentHelpRequest } from '@/lib/api/student-help';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

export function StudentHelpPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { desk, loading, error, isRefreshing, refresh, mergeDesk } = useStudentHelpDesk();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-help-block]'), {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, desk?.supportRequests.length] },
  );

  const submitRequest = async () => {
    if (title.trim().length < 3) {
      toast.error('Add a short subject.');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Describe how we can help.');
      return;
    }
    setSubmitting(true);
    const result = await submitStudentHelpRequest({ title: title.trim(), description: description.trim() });
    setSubmitting(false);
    if (result.desk) {
      mergeDesk(result.desk);
      toast.success('Support request sent — track status below.');
      setDialogOpen(false);
      setTitle('');
      setDescription('');
    } else {
      toast.error(result.error ?? 'Could not submit request.');
    }
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-help-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <LifeBuoy className="size-5 text-[var(--nestora-sage)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Help &amp; Support</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            FAQ, warden contacts, and support tickets for {desk?.hostelName ?? 'your hostel'}. Updates every 20 seconds.
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
          className={cn('gap-2 bg-[var(--nestora-forest)]', focusRing)}
          disabled={!desk?.canSubmit}
          onClick={() => setDialogOpen(true)}
        >
          <MessageSquarePlus className="size-4" aria-hidden />
          New request
        </Button>
      </header>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          <p>{error}</p>
          {error.toLowerCase().includes('authentication') ? (
            <p className="mt-2">
              <Link href="/login?returnTo=/student/help" className="font-semibold underline">
                Sign in again
              </Link>{' '}
              using <strong>http://localhost:3000</strong> (not 127.0.0.1 or :4000). Clear cookies for this site if needed.
            </p>
          ) : null}
        </div>
      ) : null}

      {loading && !desk ? (
        <motion.div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </motion.div>
      ) : null}

      {desk ? (
        <>
          <section data-student-help-block className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ['Open', desk.summary.openRequests],
                ['In progress', desk.summary.inProgress],
                ['Resolved', desk.summary.resolved],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground">{label} requests</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">{value}</p>
              </div>
            ))}
          </section>

          {desk.contacts.length > 0 ? (
            <section data-student-help-block className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Talk to someone</h2>
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {desk.contacts.map((c) => (
                  <li key={c.id} className="rounded-xl border border-border bg-muted/15 p-4">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{c.role}</p>
                    <p className="mt-0.5 font-semibold text-foreground">{c.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {c.telHref && c.phone ? (
                        <a
                          href={c.telHref}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md bg-[var(--nestora-forest)] px-2.5 py-1 text-xs font-medium text-primary-foreground',
                            focusRing,
                          )}
                        >
                          <Phone className="size-3" aria-hidden />
                          {c.phone}
                        </a>
                      ) : null}
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium',
                            focusRing,
                          )}
                        >
                          <Mail className="size-3" aria-hidden />
                          Email
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section data-student-help-block className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Quick links</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {desk.quickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/30',
                      focusRing,
                    )}
                  >
                    <span>
                      <span className="font-semibold text-foreground">{link.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{link.description}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section data-student-help-block className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Common questions</h2>
            <Accordion multiple={false} className="mt-3 w-full">
              {desk.faq.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-border">
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                    <span>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--nestora-sage)]">
                        {item.category}
                      </span>
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section data-student-help-block>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Your support requests</h2>
              <Link href="/student/complaints" className={cn('text-xs font-semibold text-[var(--nestora-sage)] hover:underline', focusRing)}>
                All complaints
              </Link>
            </div>
            {desk.supportRequests.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No requests yet. Use <strong>New request</strong> for account or general hostel questions.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {desk.supportRequests.map((row) => (
                  <li key={row.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[10px] text-muted-foreground">{row.ticketNumber}</p>
                        <p className="font-semibold text-foreground">{row.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{row.statusNote}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {row.statusLabel}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">Updated {row.updatedAt}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact support</DialogTitle>
            <DialogDescription>
              Creates a hostel support ticket (category Other). For repairs, prefer Maintenance or Complaints.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="help-title">Subject</Label>
              <Input id="help-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Portal / policy / account…" />
            </div>
            <div>
              <Label htmlFor="help-desc">How can we help?</Label>
              <Textarea
                id="help-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include enough detail for the warden office to assist."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[var(--nestora-forest)]" disabled={submitting} onClick={() => void submitRequest()}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}