'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { AuthSkiperLink } from '@/components/auth/auth-skiper-link';
import { NestoraBrandImage } from '@/components/brand/nestora-brand-image';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const topBarItem = {
  hidden: { opacity: 0, y: -10 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * index, duration: 0.42, ease: motionEase },
  }),
};

type AdminCommandTopBarProps = {
  className?: string;
};

export function AdminCommandTopBar({ className }: AdminCommandTopBarProps) {
  const reduceMotion = useReducedMotion();
  const barRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !barRef.current) {
        return;
      }
      gsap.from(barRef.current.querySelectorAll('[data-admin-topbar-line]'), {
        scaleX: 0,
        duration: 0.65,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
      });
    },
    { scope: barRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={barRef}
      data-admin-command
      className={cn(
        'relative -mx-5 mb-8 border-b border-white/12 bg-white/[0.05] px-5 pb-4 pt-1 backdrop-blur-md sm:-mx-8 sm:px-8',
        'lg:-mx-10 lg:px-10 xl:-mx-12 xl:px-12',
        className,
      )}
    >
      <div
        data-admin-topbar-line
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--nestora-gold)_45%,transparent)] opacity-80"
        aria-hidden
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.div
          className="flex min-w-0 items-center gap-3"
          custom={0}
          variants={topBarItem}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
        >
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/30"
          >
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-black/40 shadow-sm transition-[border-color,transform] duration-200 group-hover:border-[color-mix(in_oklch,var(--nestora-gold)_35%,white)] motion-reduce:group-hover:border-white/15">
              <NestoraBrandImage variant="mark" className="size-7" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                {NESTORA_BRAND_NAME}
              </span>
              <span className="block text-sm font-semibold tracking-tight text-white">
                Admin console
              </span>
            </span>
          </Link>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-end gap-2"
          custom={1}
          variants={topBarItem}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[color-mix(in_oklch,var(--nestora-forest)_40%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85">
            <span className="relative flex size-2 shrink-0" aria-hidden>
              {!reduceMotion ? (
                <motion.span
                  className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]"
                  animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
              ) : (
                <span className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]" />
              )}
            </span>
            Systems nominal
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white/70 sm:inline-flex">
            <Activity className="size-3 text-[var(--nestora-gold)]" aria-hidden />
            Live
          </span>
        </motion.div>
      </div>

      <motion.div
        className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3"
        custom={2}
        variants={topBarItem}
        initial={reduceMotion ? false : 'hidden'}
        animate="show"
      >
        <p className="inline-flex items-center gap-1.5 text-[11px] text-white/60">
          <ShieldCheck className="size-3.5 shrink-0 text-[var(--nestora-gold)]" aria-hidden />
          Privileged surface · FR-002
        </p>
        <AuthSkiperLink
          href="/login"
          className="text-[11px] font-semibold text-white/75 hover:text-white"
        >
          Institutional sign-in
        </AuthSkiperLink>
      </motion.div>
    </header>
  );
}
