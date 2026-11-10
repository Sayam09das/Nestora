'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { SAMPLE_WARDEN_MESSAGES } from '@/components/dashboard/warden/warden-topbar-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenTopbarMessagesPanel() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages] = useState(SAMPLE_WARDEN_MESSAGES);
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
        className="w-[min(100vw-2rem,22.5rem)] overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-0 shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--nestora-forest)_45%,transparent)]"
      >
        <div className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_35%,var(--card))] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--nestora-forest)]">Messages</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Communication with admin</p>
            </div>
            <button
              type="button"
              onClick={() => toast.message('Comms hub', { description: 'Messaging API connects in a later milestone.' })}
              className={cn(
                'inline-flex items-center gap-1 rounded-full bg-[var(--nestora-forest)] px-2.5 py-1 text-[10px] font-semibold text-white',
                focusRing,
              )}
            >
              <Send className="size-3" aria-hidden />
              New
            </button>
          </div>
        </div>

        <ul className="max-h-72 space-y-2 overflow-y-auto p-3">
          {messages.map((msg, index) => {
            const unread = msg.unread && !readIds.has(msg.id);
            return (
              <motion.li
                key={msg.id}
                initial={reduceMotion || !open ? false : { opacity: 0, y: 6 }}
                animate={open ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: index * 0.04, duration: 0.3, ease: motionEase }}
              >
                <button
                  type="button"
                  onClick={() => markRead(msg.id)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left transition-shadow hover:shadow-sm',
                    unread
                      ? 'border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]'
                      : 'border-border bg-card opacity-90',
                    focusRing,
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-caption font-semibold text-foreground">{msg.from}</p>
                    <time className="shrink-0 text-[10px] text-muted-foreground">{msg.time}</time>
                  </div>
                  <p className="text-[10px] text-[var(--nestora-sage)]">{msg.role}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{msg.preview}</p>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
