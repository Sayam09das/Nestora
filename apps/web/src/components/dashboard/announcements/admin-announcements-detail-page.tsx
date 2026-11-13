'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Bell, FileText, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { toast } from 'sonner';

import {
  CATEGORY_META,
  NOTICE_STATUS_STYLES,
  ackRate,
  formatNoticeDate,
  formatNoticeWhen,
  type AnnouncementRecord,
} from '@/components/dashboard/announcements/admin-announcements-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminAnnouncementsDetailPage({
  notice,
  listHref = '/admin/announcements',
}: {
  notice: AnnouncementRecord;
  listHref?: string;
}) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[notice.category];
  const Icon = meta.icon;
  const roster: Array<{ id: string; studentName: string; block: string; status: string }> = [];
  const rate = ackRate(notice);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-ann-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, notice.id] },
  );

  const sendReminders = () => {
    toast.message('Reminder job queued for pending acks (FR-090 sample).');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-ann-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href={listHref} className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Announcements
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Announcements / <span className="font-medium text-foreground">{notice.noticeRef}</span>
        </p>
      </div>

      <header
        data-ann-detail
        className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-card shadow-sm"
      >
        <div className="h-2 bg-[linear-gradient(90deg,var(--nestora-gold),var(--nestora-forest))]" aria-hidden />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
                <Icon className="size-6" style={{ color: meta.accent }} aria-hidden />
                {notice.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {notice.scope} · {notice.publishedBy}
              </p>
            </motion.div>
            <Badge variant="outline" className={cn('rounded-full', NOTICE_STATUS_STYLES[notice.status])}>
              {notice.status}
            </Badge>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">Published</dt>
              <dd className="text-sm font-medium">
                <time dateTime={notice.publishedAt}>{formatNoticeWhen(notice.publishedAt)}</time>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Expires</dt>
              <dd className="text-sm font-medium">{notice.expiresAt ? formatNoticeDate(notice.expiresAt) : 'No expiry'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Category</dt>
              <dd className="text-sm font-medium">{notice.category}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Acknowledgement</dt>
              <dd className="text-sm font-medium">{notice.requiresAcknowledgement ? `Required · ${rate}%` : 'Optional'}</dd>
            </div>
          </dl>
        </div>
      </header>

      <motion.article
        data-ann-detail
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
          <Megaphone className="size-4" aria-hidden />
          Full notice
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{notice.body}</p>
        {notice.hasAttachment ? (
          <Button type="button" variant="outline" className={cn('mt-4 rounded-xl', focusRing)}>
            <FileText className="size-4" aria-hidden />
            View attachment
          </Button>
        ) : null}
      </motion.article>

      {notice.requiresAcknowledgement ? (
        <section data-ann-detail className="rounded-2xl border bg-card shadow-sm">
          <motion.div layout className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Acknowledgement roster</h2>
              <p className="text-xs text-muted-foreground">
                {notice.acknowledgedCount} / {notice.targetCount} confirmed
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" className={cn('rounded-xl', focusRing)} onClick={sendReminders}>
              <Bell className="size-4" aria-hidden />
              Send reminders
            </Button>
          </motion.div>
          {roster.length > 0 ? (
            <ul className="divide-y">
              {roster.map((row, i) => (
                <motion.li
                  key={row.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <span>
                    <span className="font-medium text-foreground">{row.studentName}</span>
                    <span className="block text-xs text-muted-foreground">{row.block}</span>
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-full text-[10px]',
                      row.status === 'Acknowledged'
                        ? 'border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] text-[var(--nestora-forest)]'
                        : 'border-amber-200 text-amber-900',
                    )}
                  >
                    {row.status}
                  </Badge>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              Per-student acknowledgement list is not exposed on this endpoint yet — counts above are live from the database.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
