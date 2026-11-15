'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useStudentTopbarLiveContext } from '@/components/dashboard/student-portal/student-topbar-live-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StudentTopbarMessagesPanel() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const {
    messages,
    messageUnreadCount,
    readMessageIds,
    markMessageRead,
    loading,
  } = useStudentTopbarLiveContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
          'transition-colors hover:bg-muted/80',
          focusRing,
        )}
        aria-label={`Messages${messageUnreadCount > 0 ? `, ${messageUnreadCount} unread` : ''}`}
      >
        <MessageCircle className="size-4" aria-hidden />
        {messageUnreadCount > 0 ? (
          <motion.span
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[9px] font-bold text-white"
          >
            {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
          </motion.span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,22.5rem)] overflow-hidden rounded-2xl border p-0"
      >
        <div className="border-b px-4 py-3">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: motionEase }}>
            <p className="text-sm font-semibold text-[var(--nestora-forest)]">Messages</p>
            <p className="text-xs text-muted-foreground">Hostel announcements &amp; office updates</p>
          </motion.div>
          <Link
            href="/student/announcements"
            onClick={() => setOpen(false)}
            className={cn('mt-1 inline-block text-xs font-medium text-[var(--nestora-forest)] hover:underline', focusRing)}
          >
            View all notices
          </Link>
        </div>
        <ul className="max-h-[min(50vh,16rem)] divide-y overflow-y-auto p-1">
          {loading && messages.length === 0 ? (
            <li className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Syncing…
            </li>
          ) : messages.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">No recent messages.</li>
          ) : (
            messages.map((message) => {
              const unread = message.unread && !readMessageIds.has(message.id);
              return (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markMessageRead(message.id);
                      setOpen(false);
                      if (message.href) router.push(message.href);
                    }}
                    className={cn(
                      'flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/60',
                      unread && 'bg-[color-mix(in_oklch,var(--nestora-gold)_10%,transparent)]',
                      focusRing,
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[10px] font-bold text-white">
                      {message.from.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{message.from}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{message.preview}</span>
                      <span className="mt-1 block text-[10px] text-muted-foreground/80">{message.time}</span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}