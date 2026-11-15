'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Megaphone,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentAnnouncementsDesk } from '@/hooks/use-student-announcements-desk';
import {
  acknowledgeStudentNotice,
  type StudentAnnouncementItem,
} from '@/lib/api/student-announcements';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type FilterKey = 'all' | 'action' | 'emergency';

const categoryStyles = {
  Emergency:
    'border-[color-mix(in_oklch,#dc2626_30%,var(--border))] bg-[color-mix(in_oklch,#dc2626_8%,var(--card))] text-[#991b1b]',
  Fees: 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))]',
  default:
    'border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_35%,var(--card))] text-[var(--nestora-forest)]',
} as const;

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AnnouncementCard({
  item,
  index,
  reduceMotion,
  highlighted,
  acknowledging,
  onAcknowledge,
}: {
  item: StudentAnnouncementItem;
  index: number;
  reduceMotion: boolean | null;
  highlighted: boolean;
  acknowledging: boolean;
  onAcknowledge: (id: string) => void;
}) {
  const needsAck = item.requiresAcknowledgement && !item.acknowledged;
  const categoryClass =
    item.isEmergency ? categoryStyles.Emergency : item.categoryLabel === 'Fees' ? categoryStyles.Fees : categoryStyles.default;

  return (
    <motion.article
      id={`notice-${item.id}`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: motionEase }}
      className={cn(
        'rounded-2xl border bg-card p-4 shadow-sm',
        highlighted
          ? 'border-[color-mix(in_oklch,var(--nestora-gold)_45%,var(--border))] ring-2 ring-[color-mix(in_oklch,var(--nestora-gold)_25%,transparent)]'
          : 'border-border',
        item.isEmergency && 'border-[color-mix(in_oklch,#dc2626_22%,var(--border))]',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.isEmergency ? (
              <AlertTriangle className="size-4 shrink-0 text-[#dc2626]" aria-hidden />
            ) : null}
            <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">{item.title}</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.scope} · {item.publishedAt}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn('text-[10px] font-semibold uppercase', categoryClass)}>
            {item.categoryLabel}
          </Badge>
          {item.requiresAcknowledgement ? (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] font-semibold',
                item.acknowledged
                  ? 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] text-[var(--nestora-forest)]'
                  : 'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] text-[#c2410c]',
              )}
            >
              {item.acknowledged ? 'Acknowledged' : 'Ack required'}
            </Badge>
          ) : null}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{item.body}</p>

      {item.attachments.length > 0 ? (
        <ul className="mt-3 space-y-1.5 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-2 text-sm">
          {item.attachments.map((file) => (
            <li key={file.id} className="flex items-center gap-2 text-muted-foreground">
              <FileText className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{file.fileName}</span>
              <span className="text-[11px] tabular-nums">({formatFileSize(file.fileSize)})</span>
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-[var(--nestora-sage)]">{item.author}</span>
          <span className="mx-1.5">·</span>
          <time dateTime={item.relativeTime}>{item.relativeTime}</time>
          {item.acknowledgedAt ? (
            <span className="mt-1 block text-[var(--nestora-forest)]">
              You acknowledged on {item.acknowledgedAt}
            </span>
          ) : null}
        </div>
        {needsAck ? (
          <Button
            type="button"
            size="sm"
            className={cn('gap-1.5 bg-[var(--nestora-forest)]', focusRing)}
            disabled={acknowledging}
            onClick={() => onAcknowledge(item.id)}
          >
            {acknowledging ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
            I have read this
          </Button>
        ) : null}
      </footer>
    </motion.article>
  );
}

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}

export function StudentAnnouncementsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const focusId = searchParams.get('id');

  const { desk, loading, error, isRefreshing, refresh, mergeDesk } = useStudentAnnouncementsDesk();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [ackingId, setAckingId] = useState<string | null>(null);

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  const filtered = useMemo(() => {
    const list = desk?.announcements ?? [];
    if (filter === 'action') {
      return list.filter((a) => a.requiresAcknowledgement && !a.acknowledged);
    }
    if (filter === 'emergency') {
      return list.filter((a) => a.isEmergency);
    }
    return list;
  }, [desk?.announcements, filter]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-ann-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, filtered.length, filter] },
  );

  useGSAP(
    () => {
      if (!focusId || reduceMotion) return;
      const el = document.getElementById(`notice-${focusId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    { dependencies: [focusId, loading, filtered.length] },
  );

  const acknowledge = async (noticeId: string) => {
    setAckingId(noticeId);
    const result = await acknowledgeStudentNotice(noticeId);
    setAckingId(null);
    if (result.desk) {
      mergeDesk(result.desk);
      toast.success('Notice acknowledged. Thank you.');
    } else {
      toast.error(result.error ?? 'Could not acknowledge notice.');
    }
  };

  const summary = desk?.summary;

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-ann-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <Megaphone className="size-5 text-[var(--nestora-gold)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Announcements</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Notices for {desk?.hostelName ?? 'your hostel'} and university-wide circulars. Syncs every 20 seconds.
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

      {loading && !desk ? <AnnouncementsSkeleton /> : null}

      {summary ? (
        <>
          <section
            data-student-ann-block
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Announcement summary"
          >
            {(
              [
                ['Total live', summary.total],
                ['Must acknowledge', summary.mandatory],
                ['Pending ack', summary.unacknowledged],
                ['Emergency', summary.emergency],
              ] as const
            ).map(([label, value]) => (
              <motion.div
                key={label}
                className="rounded-xl border border-border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] px-4 py-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">{value}</p>
              </motion.div>
            ))}
          </section>

          <div data-student-ann-block className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All notices'],
                ['action', 'Needs action'],
                ['emergency', 'Emergency'],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? 'default' : 'outline'}
                className={filter === key ? 'bg-[var(--nestora-forest)]' : undefined}
                onClick={() => setFilter(key)}
              >
                {label}
                {key === 'action' && summary.unacknowledged > 0 ? (
                  <span className="ml-1.5 rounded-full bg-[var(--nestora-gold)] px-1.5 py-0 text-[10px] font-bold text-[#422006]">
                    {summary.unacknowledged}
                  </span>
                ) : null}
              </Button>
            ))}
          </div>

          <section data-student-ann-block className="space-y-4">
            {filtered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
                {filter === 'action'
                  ? 'You are up to date — no mandatory notices waiting for acknowledgement.'
                  : filter === 'emergency'
                    ? 'No active emergency notices.'
                    : 'No announcements right now. Check back after the warden publishes a circular.'}
              </p>
            ) : (
              filtered.map((item, index) => (
                <AnnouncementCard
                  key={item.id}
                  item={item}
                  index={index}
                  reduceMotion={reduceMotion}
                  highlighted={focusId === item.id}
                  acknowledging={ackingId === item.id}
                  onAcknowledge={acknowledge}
                />
              ))
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}