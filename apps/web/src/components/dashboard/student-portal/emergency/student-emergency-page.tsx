'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  HeartPulse,
  LifeBuoy,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Siren,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useStudentEmergencyDesk } from '@/hooks/use-student-emergency-desk';
import {
  submitStudentEmergencyReport,
  type EmergencyContactCard,
} from '@/lib/api/student-emergency';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
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

function ContactCard({ contact }: { contact: EmergencyContactCard }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{contact.role}</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--nestora-forest)]">{contact.name}</p>
        </div>
        <Badge variant="outline" className="text-[10px] capitalize">
          {contact.category}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {contact.telHref && contact.phone ? (
          <a
            href={contact.telHref}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[var(--nestora-forest)] px-3 text-xs font-medium text-primary-foreground',
              focusRing,
            )}
          >
            <Phone className="size-3.5" aria-hidden />
            {contact.phone}
          </a>
        ) : contact.phone ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <Phone className="size-3.5" aria-hidden />
            {contact.phone}
          </span>
        ) : null}
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium',
              focusRing,
            )}
          >
            <Mail className="size-3.5" aria-hidden />
            Email
          </a>
        ) : null}
      </div>
      {contact.note ? <p className="mt-2 text-xs text-muted-foreground">{contact.note}</p> : null}
    </article>
  );
}

function EmergencySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 rounded-2xl" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  );
}

export function StudentEmergencyPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { desk, loading, error, isRefreshing, refresh, mergeDesk } = useStudentEmergencyDesk();

  const [reportOpen, setReportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentType, setIncidentType] = useState('Medical');
  const [severity, setSeverity] = useState('High');

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  const personalContacts = useMemo(
    () => desk?.contacts.filter((c) => c.category === 'personal') ?? [],
    [desk?.contacts],
  );
  const hostelContacts = useMemo(
    () => desk?.contacts.filter((c) => c.category === 'hostel') ?? [],
    [desk?.contacts],
  );

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-emergency-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, desk?.contacts.length] },
  );

  const submitReport = async () => {
    if (title.trim().length < 3) {
      toast.error('Enter a short title for the incident.');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Describe what happened (at least a sentence).');
      return;
    }
    if (location.trim().length < 2) {
      toast.error('Enter where the incident is happening.');
      return;
    }
    setSubmitting(true);
    const result = await submitStudentEmergencyReport({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      incidentType,
      initialSeverity: severity,
    });
    setSubmitting(false);
    if (result.desk) {
      mergeDesk(result.desk);
      toast.success('Emergency reported. The warden desk has been notified.');
      setReportOpen(false);
      setTitle('');
      setDescription('');
      setLocation('');
    } else {
      toast.error(result.error ?? 'Could not submit report.');
    }
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-emergency-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <LifeBuoy className="size-5 text-[#dc2626]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Emergency Contacts</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tap to call guardians, warden, and national helplines. Use <strong>Report emergency</strong> for hostel incidents
            (FR-108). Live sync every 20 seconds.
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
          className={cn('gap-2 bg-[#dc2626] hover:bg-[#b91c1c]', focusRing)}
          onClick={() => setReportOpen(true)}
          disabled={!desk?.canReport}
        >
          <Siren className="size-4" aria-hidden />
          Report emergency
        </Button>
      </header>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading && !desk ? <EmergencySkeleton /> : null}

      {desk ? (
        <>
          {desk.emergencyNotices.length > 0 ? (
            <section
              data-student-emergency-block
              className="rounded-2xl border border-[color-mix(in_oklch,#dc2626_35%,var(--border))] bg-[color-mix(in_oklch,#dc2626_8%,var(--card))] p-4"
              role="alert"
            >
              <div className="flex items-center gap-2 text-[#991b1b]">
                <AlertTriangle className="size-4" aria-hidden />
                <h2 className="text-sm font-bold uppercase tracking-wide">Active emergency notices</h2>
              </div>
              <ul className="mt-3 space-y-3">
                {desk.emergencyNotices.map((n) => (
                  <li key={n.id} className="rounded-xl border border-[color-mix(in_oklch,#dc2626_20%,var(--border))] bg-card/90 p-3">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">{n.publishedLabel}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {desk.medicalAlert ? (
            <div
              data-student-emergency-block
              className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))] px-4 py-3"
            >
              <HeartPulse className="mt-0.5 size-4 text-[#c2410c]" aria-hidden />
              <div>
                <p className="text-xs font-bold uppercase text-[#9a3412]">Medical alert on file</p>
                <p className="mt-1 text-sm text-foreground">{desk.medicalAlert}</p>
              </div>
            </div>
          ) : null}

          <section data-student-emergency-block>
            <h2 className="text-base font-semibold text-[var(--nestora-forest)]">National helplines</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {desk.campusHotlines.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          </section>

          <section data-student-emergency-block>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Personal</h2>
              <Link href="/student/profile" className={cn('text-xs font-semibold text-[var(--nestora-sage)] hover:underline', focusRing)}>
                Update guardian in profile
              </Link>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {personalContacts.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          </section>

          <section data-student-emergency-block>
            <h2 className="text-base font-semibold text-[var(--nestora-forest)]">
              {desk.hostelName ? `${desk.hostelName} contacts` : 'Hostel contacts'}
            </h2>
            {hostelContacts.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Warden and staff contacts appear when you have an active allocation and staff assignments in the system.
              </p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {hostelContacts.map((c) => (
                  <ContactCard key={c.id} contact={c} />
                ))}
              </div>
            )}
          </section>

          {desk.myReports.length > 0 ? (
            <section data-student-emergency-block>
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Your recent reports</h2>
              <ul className="mt-3 space-y-2">
                {desk.myReports.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/15 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">{row.incidentRef}</p>
                      <p className="font-semibold text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">{row.submittedAt}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{row.statusLabel}</Badge>
                      <Badge variant="outline" className="border-[color-mix(in_oklch,#dc2626_25%,var(--border))]">
                        {row.severity}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report an emergency</DialogTitle>
            <DialogDescription>
              This alerts your hostel warden immediately. For life-threatening danger, call <strong>112</strong> first.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="em-title">Title</Label>
              <Input id="em-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select value={incidentType} onValueChange={(v) => v && setIncidentType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(desk?.incidentTypes ?? ['Medical']).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(desk?.incidentSeverities ?? ['High']).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="em-loc">Location</Label>
              <Input
                id="em-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Block, floor, room, or area"
              />
            </div>
            <div>
              <Label htmlFor="em-desc">What happened?</Label>
              <Textarea
                id="em-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the situation clearly for the warden desk."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#dc2626] hover:bg-[#b91c1c]" disabled={submitting} onClick={() => void submitReport()}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Send to warden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}