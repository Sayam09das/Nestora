'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { SAMPLE_STUDENT_MESSAGES } from '@/components/dashboard/student-portal/student-topbar-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StudentTopbarMessagesPanel() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages] = useState(SAMPLE_STUDENT_MESSAGES);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const unreadCount = useMemo(
    () => messages.filter((m) => m.unread && !readIds.has(m.id)).length,
    [messages, readIds],
  );

  const markRead = useCallback((id: string) => {
    setReadIds((current) => new Set(current).add(id));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
          'transition-colors hover:bg-muted/80',
          focusRing,
        )}
        aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <MessageCircle className="size-4" aria-hidden />
        {unreadCount > 0 ? (
          <motion.span
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[9px] font-bold text-white"
          >
            {unreadCount}
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
            <p className="text-xs text-muted-foreground">Warden & admin communication</p>
          </motion.div>
          <Link
            href="/student/messages"
            onClick={() => setOpen(false)}
            className={cn('mt-1 inline-block text-xs font-medium text-[var(--nestora-forest)] hover:underline', focusRing)}
          >
            Open inbox
          </Link>
        </div>
        <ul className="max-h-[min(50vh,16rem)] divide-y overflow-y-auto p-1">
          {messages.map((message) => {
            const unread = message.unread && !readIds.has(message.id);
            return (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(message.id);
                    toast.message(message.from, { description: message.preview });
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
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
