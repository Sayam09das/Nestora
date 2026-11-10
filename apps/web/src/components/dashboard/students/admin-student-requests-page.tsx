'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Eye, FileText, History, RotateCcw, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { getStudentInitials } from '@/components/dashboard/students/admin-students-data';
import {
  formatHistoryTimestamp,
  formatRequestDate,
  REQUEST_DIRECTORY_STATS,
  REQUEST_STATUS_TABS,
  REQUEST_TYPE_OPTIONS,
  SAMPLE_STUDENT_REQUESTS,
  type RequestHistoryEntry,
  type RequestStatus,
  type StudentRequestRecord,
} from '@/components/dashboard/students/admin-student-requests-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const PAGE_SIZE_OPTIONS = [5, 8, 12] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    Pending:
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
    Approved:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
    Rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-semibold', styles[status])}>
      {status}
    </Badge>
  );
}

export function AdminStudentRequestsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [requests, setRequests] = useState<StudentRequestRecord[]>(SAMPLE_STUDENT_REQUESTS);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<(typeof REQUEST_STATUS_TABS)[number]>('All');
  const [typeFilter, setTypeFilter] = useState<(typeof REQUEST_TYPE_OPTIONS)[number]>('All Types');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState<number>(5);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_STUDENT_REQUESTS[0]?.id ?? '');
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((row) => {
      if (statusTab !== 'All' && row.status !== statusTab) {
        return false;
      }
      if (typeFilter !== 'All Types' && row.type !== typeFilter) {
        return false;
      }
      if (dateFrom && row.submittedAt < dateFrom) {
        return false;
      }
      if (dateTo && row.submittedAt > dateTo) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.requestId.toLowerCase().includes(q) ||
        row.studentId.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusTab, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? pageRows[0] ?? filtered[0],
    [requests, selectedId, pageRows, filtered],
  );

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) {
        return;
      }
      gsap.from(rootRef.current.querySelectorAll('[data-req-reveal]'), {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  useGSAP(
    () => {
      if (reduceMotion || !listRef.current) {
        return;
      }
      gsap.from(listRef.current.querySelectorAll('[data-req-row]'), {
        opacity: 0,
        x: -8,
        duration: 0.28,
        stagger: 0.04,
        ease: 'power1.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: listRef, dependencies: [safePage, pageSize, statusTab, typeFilter, search, reduceMotion] },
  );

  const resetFilters = () => {
    setSearch('');
    setStatusTab('All');
    setTypeFilter('All Types');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const appendHistory = (id: string, entry: Omit<RequestHistoryEntry, 'id'>) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              history: [...r.history, { ...entry, id: `h-${Date.now()}` }],
            }
          : r,
      ),
    );
  };

  const handleApprove = () => {
    if (!selected || selected.status !== 'Pending') {
      setApproveOpen(false);
      return;
    }
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, status: 'Approved' as const } : r)),
    );
    appendHistory(selected.id, {
      action: 'Approved',
      actor: 'Admin — Nestora',
      remarks: 'Student will be notified by email.',
      at: now,
    });
    setApproveOpen(false);
    toast.success('Request approved', { description: `${selected.requestId} · ${selected.studentName}` });
  };

  const handleReject = () => {
    if (!selected) {
      return;
    }
    const remarks = rejectRemarks.trim();
    if (!remarks) {
      setRejectError('Rejection reason is required');
      return;
    }
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, status: 'Rejected' as const } : r)),
    );
    appendHistory(selected.id, {
      action: 'Rejected',
      actor: 'Admin — Nestora',
      remarks,
      at: now,
    });
    setRejectOpen(false);
    setRejectRemarks('');
    setRejectError(null);
    toast.success('Request rejected', { description: 'Student notification queued (preview).' });
  };

  const statCards = [
    { label: 'Total Requests', value: REQUEST_DIRECTORY_STATS.total, tone: 'forest' },
    { label: 'Pending', value: REQUEST_DIRECTORY_STATS.pending, tone: 'gold' },
    { label: 'Approved', value: REQUEST_DIRECTORY_STATS.approved, tone: 'sage' },
    { label: 'Rejected', value: REQUEST_DIRECTORY_STATS.rejected, tone: 'muted' },
  ] as const;

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header
        data-req-reveal
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[#6d9773]" aria-hidden />
        <div className="pl-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
            Dashboard / Students / Student Requests
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--nestora-forest)]">Student Requests</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review, approve, or reject requests submitted by students.
          </p>
        </div>
      </header>

      <ul data-req-reveal className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.li
            key={card.label}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: motionEase }}
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">
              {card.value.toLocaleString('en-IN')}
            </p>
          </motion.li>
        ))}
      </ul>

      <section
        data-req-reveal
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-4 shadow-sm sm:p-5"
        aria-label="Search and filters"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--nestora-forest)]">Request overview</p>
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={resetFilters}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pb-4">
          {REQUEST_STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatusTab(tab);
                setPage(1);
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                focusRing,
                statusTab === tab
                  ? 'border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--card))] text-[var(--nestora-forest)]'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-12">
          <label className="relative lg:col-span-5">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Student, request ID, type…"
              className="h-10 rounded-xl border-[var(--nestora-sage-muted)] pl-9"
            />
          </label>
          <label className="relative lg:col-span-3">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as (typeof REQUEST_TYPE_OPTIONS)[number]);
                setPage(1);
              }}
              className={cn('h-10 w-full appearance-none rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 pr-9 text-sm', focusRing)}
            >
              {REQUEST_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-[calc(50%+10px)] right-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          </label>
          <label className="lg:col-span-2">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">From</span>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-10 rounded-xl" />
          </label>
          <label className="lg:col-span-2">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">To</span>
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-10 rounded-xl" />
          </label>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section
          ref={listRef}
          className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm"
          aria-labelledby="requests-list-heading"
        >
          <div className="border-b border-[var(--nestora-sage-muted)]/70 px-4 py-3 sm:px-5">
            <h2 id="requests-list-heading" className="text-sm font-semibold text-[var(--nestora-forest)]">
              Requests list
            </h2>
            <p className="text-xs text-muted-foreground">
              {filtered.length} match{filtered.length === 1 ? '' : 'es'} · page {safePage} of {totalPages}
            </p>
          </div>
          <ul className="max-h-[28rem] divide-y divide-[var(--nestora-sage-muted)]/60 overflow-y-auto">
            {pageRows.length === 0 ? (
              <li className="px-4 py-12 text-center text-sm text-muted-foreground">No requests match these filters.</li>
            ) : (
              pageRows.map((row) => {
                const active = selected?.id === row.id;
                return (
                  <li key={row.id} data-req-row>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors sm:px-5',
                        focusRing,
                        active
                          ? 'bg-[color-mix(in_oklch,var(--nestora-sage)_14%,var(--card))]'
                          : 'hover:bg-muted/40',
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))] text-xs font-bold text-[var(--nestora-forest)]">
                        {getStudentInitials(row.studentName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{row.type}</span>
                          <RequestStatusBadge status={row.status} />
                        </span>
                        <span className="mt-0.5 block text-sm text-foreground">{row.studentName}</span>
                        <span className="block text-xs text-muted-foreground">
                          {row.studentId} · {row.requestId}
                        </span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          Submitted: {formatRequestDate(row.submittedAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="flex flex-col gap-2 border-t border-[var(--nestora-sage-muted)]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-[var(--nestora-sage-muted)] bg-card px-2 text-sm"
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={cn('rounded-xl', safePage <= 1 && 'pointer-events-none opacity-50')}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()} className="rounded-xl">
                    {safePage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={cn('rounded-xl', safePage >= totalPages && 'pointer-events-none opacity-50')}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.section
              key={selected.id}
              data-req-reveal
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: motionEase }}
              className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm"
              aria-labelledby="request-detail-heading"
            >
              <div className="border-b border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Request details</p>
                    <h2 id="request-detail-heading" className="text-lg font-semibold text-[var(--nestora-forest)]">
                      {selected.requestId}
                    </h2>
                    <RequestStatusBadge status={selected.status} />
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-foreground">{selected.type}</p>
                    <p className="text-foreground">{selected.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selected.studentId} · Submitted {formatRequestDate(selected.submittedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-4 py-5 sm:px-5">
                <motion.div whileHover={reduceMotion ? undefined : { scale: 1.002 }}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Request description</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">{selected.description}</p>
                </motion.div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Student&apos;s reason</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">{selected.reason}</p>
                </div>
                {selected.documents.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Supporting documents</h3>
                    <ul className="mt-2 space-y-2">
                      {selected.documents.map((doc) => (
                        <li
                          key={doc.name}
                          className="flex items-center gap-2 rounded-xl border border-[var(--nestora-sage-muted)] bg-muted/20 px-3 py-2 text-sm"
                        >
                          <FileText className="size-4 text-[var(--nestora-sage)]" aria-hidden />
                          <span className="font-medium">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">({doc.kind})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <History className="size-3.5" aria-hidden />
                    Decision history
                  </h3>
                  <ol className="relative mt-3 space-y-3 border-l border-[var(--nestora-sage-muted)] pl-4">
                    {selected.history.map((entry) => (
                      <li key={entry.id} className="relative text-sm">
                        <span className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-[#6d9773]" aria-hidden />
                        <p className="font-semibold text-foreground">
                          {entry.action} · <span className="font-normal text-muted-foreground">{entry.actor}</span>
                        </p>
                        {entry.remarks ? <p className="text-muted-foreground">{entry.remarks}</p> : null}
                        <p className="text-[11px] text-muted-foreground">{formatHistoryTimestamp(entry.at)}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <motion.footer
                className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_10%,var(--card))] px-4 py-3 sm:px-5"
                layout
              >
                <Button
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  render={
                    <Link
                      href={`/admin/students/${selected.studentId.replace(/^STU-0*/, '') || selected.studentId}`}
                    />
                  }
                >
                  <Eye className="size-3.5" aria-hidden />
                  View student
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={selected.status !== 'Pending'}
                    onClick={() => {
                      setRejectRemarks('');
                      setRejectError(null);
                      setRejectOpen(true);
                    }}
                  >
                    <X className="size-3.5" aria-hidden />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl bg-[var(--nestora-forest)] hover:bg-[var(--nestora-forest)]/90"
                    disabled={selected.status !== 'Pending'}
                    onClick={() => setApproveOpen(true)}
                  >
                    <Check className="size-3.5" aria-hidden />
                    Approve
                  </Button>
                </div>
              </motion.footer>
            </motion.section>
          ) : (
            <div className="flex min-h-[20rem] items-center justify-center rounded-2xl border border-dashed border-[var(--nestora-sage-muted)] bg-card/50 p-8 text-sm text-muted-foreground">
              Select a request to review details.
            </div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-muted-foreground" role="note">
        Illustrative preview with sample records. Approval and rejection buttons are visual examples.
      </p>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this request?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected?.requestId} for {selected?.studentName} will be marked approved and the student will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-[var(--nestora-forest)]" onClick={handleApprove}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject request</AlertDialogTitle>
            <AlertDialogDescription>
              A reason is required. The student will receive this message with the rejection notice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Remarks</span>
            <Textarea
              value={rejectRemarks}
              onChange={(e) => {
                setRejectRemarks(e.target.value);
                setRejectError(null);
              }}
              rows={3}
              className={cn('rounded-xl', rejectError && 'border-destructive')}
              aria-invalid={Boolean(rejectError)}
            />
            {rejectError ? (
              <span className="text-xs text-destructive" role="alert">
                {rejectError}
              </span>
            ) : null}
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleReject();
              }}
            >
              Reject & notify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
