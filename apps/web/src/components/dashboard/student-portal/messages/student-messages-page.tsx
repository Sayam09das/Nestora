'use client';

import { motion } from 'framer-motion';
import { Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useStudentTopbarLiveContext } from '@/components/dashboard/student-portal/student-topbar-live-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StudentMessagesPage() {
  const router = useRouter();
  const { messages, messageUnreadCount, readMessageIds, markMessageRead, loading, refresh } =
    useStudentTopbarLiveContext();

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-[var(--nestora-sage)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Messages</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Hostel announcements and office updates in one inbox. Pulled from live notices (same as the top bar).
          </p>
          <motion.p className="mt-2 text-xs text-muted-foreground">
            {messageUnreadCount > 0 ? `${messageUnreadCount} unread` : 'All caught up'}
          </motion.p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => void refresh()} disabled={loading}>
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Refresh
          </Button>
          <Link
            href="/student/announcements"
            className={cn(
              'inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium',
              focusRing,
            )}
          >
            All notices
          </Link>
        </div>
      </header>

      {loading && messages.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading messages…
        </p>
      ) : messages.length === 0 ? (
        <motion.div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No messages yet. Warden and university notices will appear here.
        </motion.div>
      ) : (
        <ul className="divide-y rounded-2xl border border-border bg-card">
          {messages.map((message) => {
            const unread = message.unread && !readMessageIds.has(message.id);
            return (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => {
                    markMessageRead(message.id);
                    if (message.href) router.push(message.href);
                  }}
                  className={cn(
                    'flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40',
                    unread && 'bg-[color-mix(in_oklch,var(--nestora-gold)_8%,transparent)]',
                    focusRing,
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-xs font-bold text-white">
                    {message.from.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{message.from}</span>
                      <span className="text-[10px] text-muted-foreground">{message.role}</span>
                      {unread ? (
                        <span className="rounded-full bg-[var(--nestora-gold)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--nestora-forest)]">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{message.preview}</span>
                    <span className="mt-1 block text-[10px] text-muted-foreground">{message.time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}