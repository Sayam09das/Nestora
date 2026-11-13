'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Pin } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  CATEGORY_META,
  NOTICE_STATUS_STYLES,
  ackRate,
  formatNoticeWhen,
  type AnnouncementRecord,
} from '@/components/dashboard/announcements/admin-announcements-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  notices: AnnouncementRecord[];
  listKey: string;
  hidden?: boolean;
  detailBasePath?: string;
};

export function AdminAnnouncementsFeed({ notices, listKey, hidden, detailBasePath = '/admin/announcements' }: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !gridRef.current || hidden) return;
      gsap.from(gridRef.current.querySelectorAll('[data-ann-card]'), {
        opacity: 0,
        scale: 0.92,
        y: 16,
        duration: 0.4,
        stagger: { each: 0.06, grid: 'auto' },
        ease: 'back.out(1.2)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: gridRef, dependencies: [listKey, hidden, reduceMotion] },
  );

  return (
    <section
      ref={gridRef}
      data-ann-reveal
      data-ann-flip
      aria-label="Notice feed"
      hidden={hidden}
      className={cn(hidden && 'hidden')}
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {notices.map((notice) => (
          <li
            key={notice.id}
            data-ann-flip
            className={cn(notice.pinned && 'sm:col-span-2 xl:col-span-1')}
          >
            <AnnouncementCard notice={notice} featured={notice.pinned} detailBasePath={detailBasePath} />
          </li>
        ))}
      </ul>
      {notices.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No notices match filters.</p> : null}
    </section>
  );
}

function AnnouncementCard({
  notice,
  featured,
  detailBasePath,
}: {
  notice: AnnouncementRecord;
  featured?: boolean;
  detailBasePath: string;
}) {
  const reduceMotion = useReducedMotion();
  const meta = CATEGORY_META[notice.category];
  const Icon = meta.icon;
  const rate = ackRate(notice);

  return (
    <motion.article
      data-ann-card
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'group relative h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md',
        featured
          ? 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[linear-gradient(145deg,color-mix(in_oklch,var(--nestora-gold)_12%,var(--card)),var(--card))]'
          : 'border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))]',
      )}
    >
      <div className="h-1.5 w-full" style={{ background: meta.accent }} aria-hidden />
      <Link href={`${detailBasePath}/${notice.id}`} className={cn('flex h-full flex-col p-4 sm:p-5', focusRing)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
              style={{
                color: meta.accent,
                borderColor: `color-mix(in oklch, ${meta.accent} 30%, var(--border))`,
              }}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <motion.div layout="position" className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground">{notice.noticeRef}</p>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[var(--nestora-forest)]">{notice.title}</h3>
            </motion.div>
          </div>
          {notice.pinned ? (
            <span className="shrink-0 text-[var(--nestora-gold)]" title="Pinned">
              <Pin className="size-4" aria-hidden />
              <span className="sr-only">Pinned</span>
            </span>
          ) : null}
        </div>
        <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{notice.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn('rounded-full text-[10px]', NOTICE_STATUS_STYLES[notice.status])}>
            {notice.status}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{notice.scope}</span>
          {notice.hasAttachment ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <FileText className="size-3" aria-hidden />
              PDF
            </span>
          ) : null}
        </div>
        {notice.requiresAcknowledgement ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Acknowledgements</span>
              <span className="font-semibold tabular-nums text-foreground">{rate}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e7e7dc]">
              <div className="h-full rounded-full bg-[var(--nestora-forest)]" style={{ width: `${rate}%` }} />
            </div>
          </div>
        ) : null}
        <time className="mt-3 block text-[10px] text-muted-foreground" dateTime={notice.publishedAt}>
          {formatNoticeWhen(notice.publishedAt)} · {notice.publishedBy}
        </time>
      </Link>
    </motion.article>
  );
}
