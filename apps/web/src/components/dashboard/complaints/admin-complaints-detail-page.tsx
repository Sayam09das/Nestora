'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Camera, MessageSquareWarning, User } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { AdminComplaintsAssignDrawer } from '@/components/dashboard/complaints/admin-complaints-assign-drawer';
import {
  CATEGORY_META,
  PRIORITY_STYLES,
  effectivePriority,
  formatComplaintWhen,
  hoursOpenSince,
  slaRemainingHours,
  timelineForTicket,
  type ComplaintTicket,
  type ComplaintTimelineEntry,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminComplaintsDetailPage({
  ticket: initial,
  timeline: timelineProp,
  listHref = '/admin/complaints',
}: {
  ticket: ComplaintTicket;
  timeline?: ComplaintTimelineEntry[];
  listHref?: string;
}) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const meta = CATEGORY_META[ticket.category];
  const Icon = meta.icon;
  const priority = effectivePriority(ticket);
  const timeline = timelineProp ?? timelineForTicket(ticket.id);
  const slaLeft = slaRemainingHours(ticket);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-cmp-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, ticket.id] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-cmp-detail className="flex flex-wrap items-center gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          className="rounded-xl"
          render={<Link href={listHref} className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Complaints
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Complaints / <span className="font-medium text-foreground">{ticket.ticketNumber}</span>
        </p>
      </div>

      <header
        data-cmp-detail
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
              <span
                className="flex size-10 items-center justify-center rounded-xl border"
                style={{
                  color: meta.accent,
                  borderColor: `color-mix(in oklch, ${meta.accent} 35%, var(--border))`,
                }}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              {ticket.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {ticket.hostel} · {ticket.location}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              {ticket.status}
            </Badge>
            <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase', PRIORITY_STYLES[priority])}>
              {priority}
            </span>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">Resident</dt>
            <dd className="text-base font-medium">{ticket.studentName}</dd>
            <dd className="text-xs text-muted-foreground">{ticket.studentId}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Assignee</dt>
            <dd className="text-base font-medium">{ticket.assignedStaff ?? 'Unassigned'}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Open for</dt>
            <dd className="text-base font-semibold tabular-nums">{hoursOpenSince(ticket.openedAt)}h</dd>
            <dd className="text-xs text-muted-foreground">
              SLA {ticket.slaBreached ? 'breached' : `${slaLeft}h remaining`}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Last update</dt>
            <dd className="text-base tabular-nums">{formatComplaintWhen(ticket.updatedAt)}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
            onClick={() => setDrawerOpen(true)}
          >
            <User className="size-4" aria-hidden />
            Reassign
          </Button>
          {ticket.hasPhoto ? (
            <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)}>
              <Camera className="size-4" aria-hidden />
              View attachment
            </Button>
          ) : null}
        </div>
      </header>

      <motion.section
        data-cmp-detail
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[1fr,20rem]"
      >
        <article className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
            <MessageSquareWarning className="size-4" aria-hidden />
            Description
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Opened <time dateTime={ticket.openedAt}>{formatComplaintWhen(ticket.openedAt)}</time>
            {ticket.finalPriority ? (
              <>
                {' '}
                · Warden priority set to <span className="font-medium text-foreground">{ticket.finalPriority}</span>
              </>
            ) : (
              <>
                {' '}
                · Awaiting warden priority (student suggested {ticket.suggestedPriority})
              </>
            )}
          </p>
        </article>

        <aside className="rounded-2xl border bg-card p-5 shadow-sm" aria-label="Status timeline">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Audit timeline</h2>
          <p className="mt-1 text-xs text-muted-foreground">FR-073 · status, notes, timestamps</p>
          <ol className="mt-4 space-y-4 border-l border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] pl-4">
            {timeline.length === 0 ? (
              <li className="text-xs text-muted-foreground">No history entries in sample data.</li>
            ) : (
              timeline.map((entry) => (
                <li key={entry.id} className="relative">
                  <span
                    className="absolute -left-[1.3rem] top-1 size-2.5 rounded-full bg-[var(--nestora-forest)] ring-4 ring-[color-mix(in_oklch,var(--nestora-cream)_40%,var(--card))]"
                    aria-hidden
                  />
                  <p className="text-xs font-semibold text-foreground">{entry.status}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.actor} · <time dateTime={entry.at}>{formatComplaintWhen(entry.at)}</time>
                  </p>
                  {entry.notes ? <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p> : null}
                </li>
              ))
            )}
          </ol>
        </aside>
      </motion.section>

      <AdminComplaintsAssignDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        preselectTicketId={ticket.id}
        tickets={[ticket]}
        onAssigned={(updated) => {
          if (updated.id === ticket.id) {
            setTicket(updated);
          }
        }}
      />
    </div>
  );
}
