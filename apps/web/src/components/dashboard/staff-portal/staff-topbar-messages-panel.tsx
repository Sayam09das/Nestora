'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { SAMPLE_STAFF_MESSAGES } from '@/components/dashboard/staff-portal/staff-topbar-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StaffTopbarMessagesPanel() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages] = useState(SAMPLE_STAFF_MESSAGES);
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
        className="w-[min(100vw-2rem,22.5rem)] overflow-hidden rounded-2xl border p-0 shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--nestora-forest)_45%,transparent)]"
      >
        <div className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_35%,var(--card))] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--nestora-forest)]">Messages</p>
              <p className="text-xs text-muted-foreground">Warden & admin communication</p>
            </div>
            <Link
              href="/staff/messages"
              onClick={() => setOpen(false)}
              className={cn('text-xs font-medium text-[var(--nestora-forest)] hover:underline', focusRing)}
            >
              Open inbox
            </Link>
          </div>
        </div>
        <ul className="max-h-[min(55vh,18rem)] divide-y overflow-y-auto p-1">
          {messages.map((message, index) => {
            const unread = message.unread && !readIds.has(message.id);
            return (
              <motion.li
                key={message.id}
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: motionEase }}
              >
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
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{message.from}</span>
                      {unread ? <span className="size-1.5 rounded-full bg-[var(--nestora-gold)]" aria-hidden /> : null}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{message.preview}</span>
                    <span className="mt-1 block text-[10px] text-muted-foreground/80">{message.time}</span>
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
        <div className="border-t p-2">
          <button
            type="button"
            onClick={() => toast.message('Compose', { description: 'Full messaging opens from the inbox page.' })}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50',
              focusRing,
            )}
          >
            <Send className="size-3.5" aria-hidden />
            Quick reply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
