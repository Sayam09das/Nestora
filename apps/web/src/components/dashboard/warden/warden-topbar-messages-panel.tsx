'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useWardenTopbarLiveContext } from '@/components/dashboard/warden/warden-topbar-live-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenTopbarMessagesPanel() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { messages, messageUnreadCount, readMessageIds, markMessageRead, loading } = useWardenTopbarLiveContext();

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
        className="w-[min(100vw-2rem,22.5rem)] overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-0 shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--nestora-forest)_45%,transparent)]"
      >
        <div className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_35%,var(--card))] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--nestora-forest)]">Messages</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Live hostel notices</p>
            </div>
            <Link
              href="/warden/announcements"
              onClick={() => setOpen(false)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full bg-[var(--nestora-forest)] px-2.5 py-1 text-[10px] font-semibold text-white',
                focusRing,
              )}
            >
              <Send className="size-3" aria-hidden />
              All notices
            </Link>
          </div>
        </div>

        <ul className="max-h-72 space-y-2 overflow-y-auto p-3">
          {loading && messages.length === 0 ? (
            <li className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Syncing…
            </li>
          ) : null}
          {!loading && messages.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">No live notices for your hostel.</li>
          ) : null}
          {messages.map((msg, index) => {
            const unread = msg.unread && !readMessageIds.has(msg.id);
            const body = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-caption font-semibold text-foreground">{msg.from}</p>
                  <time className="shrink-0 text-[10px] text-muted-foreground">{msg.time}</time>
                </div>
                <p className="text-[10px] text-[var(--nestora-sage)]">{msg.role}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{msg.preview}</p>
              </>
            );
            return (
              <motion.li
                key={msg.id}
                initial={reduceMotion || !open ? false : { opacity: 0, y: 6 }}
                animate={open ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: index * 0.04, duration: 0.3, ease: motionEase }}
              >
                {msg.href ? (
                  <Link
                    href={msg.href}
                    onClick={() => markMessageRead(msg.id)}
                    className={cn(
                      'block w-full rounded-xl border p-3 text-left transition-shadow hover:shadow-sm',
                      unread
                        ? 'border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]'
                        : 'border-border bg-card opacity-90',
                      focusRing,
                    )}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => markMessageRead(msg.id)}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition-shadow hover:shadow-sm',
                      unread
                        ? 'border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]'
                        : 'border-border bg-card opacity-90',
                      focusRing,
                    )}
                  >
                    {body}
                  </button>
                )}
              </motion.li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
