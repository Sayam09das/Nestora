'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Building2, Globe2, Loader2, RefreshCw, ScrollText, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentRulesDesk } from '@/hooks/use-student-rules-desk';
import type { StudentRuleItem } from '@/lib/api/student-rules';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type FilterKey = 'all' | 'university' | 'hostel';

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

function RuleCard({
  item,
  index,
  reduceMotion,
}: {
  item: StudentRuleItem;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: motionEase }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">{item.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.updatedLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[10px] font-semibold">
            {item.scope}
          </Badge>
          {item.source === 'notice' ? (
            <Badge
              variant="outline"
              className="border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] text-[10px] font-semibold"
            >
              Circular
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] text-[10px] font-semibold text-[var(--nestora-forest)]"
            >
              Policy
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{item.body}</p>
    </motion.article>
  );
}

function RulesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}

export function StudentRulesPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { desk, loading, error, isRefreshing, refresh } = useStudentRulesDesk();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = desk?.rules ?? [];
    if (filter === 'university') list = list.filter((r) => r.scopeKind === 'university');
    if (filter === 'hostel') list = list.filter((r) => r.scopeKind === 'hostel');
    if (needle) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(needle) ||
          r.body.toLowerCase().includes(needle) ||
          r.scope.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [desk?.rules, filter, query]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-rules-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, filtered.length, filter, query] },
  );

  const summary = desk?.summary;

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-rules-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <ScrollText className="size-5 text-[var(--nestora-forest)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Hostel Rules &amp; Policies</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Official conduct policies for {desk?.hostelName ?? 'your hostel'} plus university-wide rules. Updates sync every
            20 seconds.
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

      {loading && !desk ? <RulesSkeleton /> : null}

      {summary ? (
        <>
          <section data-student-rules-block className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="size-3.5" aria-hidden />
                Total policies
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">{summary.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe2 className="size-3.5" aria-hidden />
                University-wide
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{summary.university}</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden />
                Your hostel
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{summary.hostel}</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">From circulars</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{summary.fromNotices}</p>
            </div>
          </section>

          <motion.div data-student-rules-block className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rules, timings, conduct…"
                className="pl-9"
                aria-label="Search rules"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'All'],
                  ['university', 'University'],
                  ['hostel', 'Hostel'],
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
                </Button>
              ))}
            </div>
          </motion.div>

          <section data-student-rules-block className="space-y-4">
            {filtered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
                No rules published yet for your scope. Administrators add records to{' '}
                <span className="font-mono">hostel_rules</span>, or wardens can publish{' '}
                <strong>Hostel Rules</strong> notices.
              </p>
            ) : (
              filtered.map((item, index) => (
                <RuleCard key={item.id} item={item} index={index} reduceMotion={reduceMotion} />
              ))
            )}
          </section>

          <p data-student-rules-block className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_20%,var(--card))] px-4 py-3 text-sm text-muted-foreground">
            Violations are handled through the disciplinary process. For leave and visitor timings, also see{' '}
            <Link href="/student/leave" className="font-semibold text-[var(--nestora-forest)] hover:underline">
              Leave
            </Link>{' '}
            and{' '}
            <Link href="/student/visitors" className="font-semibold text-[var(--nestora-forest)] hover:underline">
              Visitors
            </Link>
            .
          </p>
        </>
      ) : null}
    </div>
  );
}