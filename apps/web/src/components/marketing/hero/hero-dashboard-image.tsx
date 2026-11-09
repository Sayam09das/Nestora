'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BedDouble, CheckCircle2, Lock, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type TabItem = {
  id: 'matrix' | 'attendance' | 'finance';
  label: string;
  icon: typeof BedDouble;
  src: string;
  alt: string;
  url: string;
  statBadge: string;
  featureNote: string;
};

const TABS: TabItem[] = [
  {
    id: 'matrix',
    label: 'Room & Bed Matrix',
    icon: BedDouble,
    src: '/images/hero-dashboard.png',
    alt: 'Nestora live room and bed matrix showing occupancy and allocation status across campus hostel blocks',
    url: 'nestora.university.edu/admin/occupancy-matrix',
    statBadge: '98.4% Live Occupancy · 1,420 Active Beds',
    featureNote: 'Real-time multi-campus allocation & bed occupancy status',
  },
  {
    id: 'attendance',
    label: 'Biometric Gate Pass',
    icon: ShieldCheck,
    src: '/images/module-previews/attendance-preview.png',
    alt: 'Nestora biometric attendance and gate movement logs tracking entries and exits in real time',
    url: 'nestora.university.edu/gate/live-turnstiles',
    statBadge: '4,280 Daily Movements · Zero Unaccounted Curfews',
    featureNote: 'Instant turnstile verification with digital leave slip sync',
  },
  {
    id: 'finance',
    label: 'Fee Reconciliation',
    icon: TrendingUp,
    src: '/images/module-previews/reports-preview.png',
    alt: 'Nestora finance and fee reconciliation reports tracking dues, collections, and settlement velocity',
    url: 'nestora.university.edu/finance/collections-audit',
    statBadge: '₹18.4L Fees Settled · 96.4% On-Time Clearance',
    featureNote: 'Automated challan reconciliation & split-term dues audit',
  },
];

const DEFAULT_TAB: TabItem = TABS[0] as TabItem;

type HeroDashboardImageProps = {
  className?: string;
};

export function HeroDashboardImage({ className }: HeroDashboardImageProps) {
  const [activeTab, setActiveTab] = useState<TabItem['id']>('matrix');
  const reduceMotion = useReducedMotion();

  const currentTab = TABS.find((t) => t.id === activeTab) ?? DEFAULT_TAB;

  return (
    <figure
      id="dashboard-preview"
      className={cn('relative mx-auto w-full max-w-5xl scroll-mt-28', className)}
      aria-label="Nestora interactive SaaS workspace preview"
    >
      {/* 21st.dev Ambient Glow Aura */}
      <div
        className="pointer-events-none absolute -inset-6 sm:-inset-10 -z-10 rounded-[3rem] opacity-70 blur-3xl hero-aura-ambient"
        aria-hidden
      />

      {/* Interactive SaaS Tab Switcher Strip */}
      <div className="mb-4 flex flex-wrap items-center gap-3 px-2 sm:px-4">
        <div
          role="tablist"
          aria-label="SaaS workspace views"
          className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-border/80 bg-card/85 p-1 shadow-xs backdrop-blur-md"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-caption font-semibold transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'bg-[var(--nestora-forest)] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                <Icon
                  className={cn(
                    'size-3.5 transition-colors',
                    isSelected
                      ? 'text-[var(--nestora-gold)]'
                      : 'text-muted-foreground group-hover:text-foreground',
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modern SaaS Browser Window Container */}
      <div className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--foreground)_10%,var(--border))] bg-card shadow-[0_24px_80px_-24px_color-mix(in_oklch,var(--nestora-forest)_45%,transparent)] sm:rounded-3xl">
        {/* Browser Top Window Bar */}
        <div className="flex h-11 items-center justify-between border-b border-border/80 bg-[color-mix(in_srgb,var(--card)_92%,var(--nestora-cream))] px-4 backdrop-blur-md">
          {/* Traffic light buttons */}
          <div className="flex items-center gap-2" aria-hidden>
            <span className="size-3 rounded-full bg-[#ff5f56] shadow-2xs" />
            <span className="size-3 rounded-full bg-[#ffbd2e] shadow-2xs" />
            <span className="size-3 rounded-full bg-[#27c93f] shadow-2xs" />
          </div>

          {/* Centered Omnibar Address */}
          <div className="flex max-w-[280px] sm:max-w-md flex-1 items-center justify-center px-2">
            <div className="flex w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-mono text-muted-foreground shadow-2xs backdrop-blur-xs">
              <Lock className="size-3 text-emerald-600 shrink-0" aria-hidden />
              <span className="truncate text-foreground/80">{currentTab.url}</span>
              <RefreshCw
                className="ml-auto size-2.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                aria-hidden
              />
            </div>
          </div>

          {/* Right Live Tag */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--nestora-forest)]">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            <span className="hidden sm:inline font-mono text-[10px] tracking-wider uppercase opacity-80">
              Live OS
            </span>
          </div>
        </div>

        {/* View Content Area */}
        <div
          id={`panel-${currentTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${currentTab.id}`}
          className="relative aspect-[16/9] w-full overflow-hidden bg-card"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.99 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="relative size-full"
            >
              <Image
                src={currentTab.src}
                alt={currentTab.alt}
                fill
                priority
                quality={95}
                sizes="(max-width: 640px) 100vw, (max-width: 1200px) 92vw, 80rem"
                className="object-cover object-top select-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Light reflection overlay line */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
            aria-hidden
          />
        </div>

        {/* Browser Footer Context Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-card/95 px-4 py-2.5 text-caption text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
            <span className="font-medium text-foreground">{currentTab.featureNote}</span>
          </div>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground/90">
            <span className="relative flex size-1.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="max-w-[min(100%,20rem)] text-right font-medium text-foreground/85 sm:max-w-none">
              {currentTab.statBadge}
            </span>
          </span>
        </div>
      </div>

      {/* Floating 21st.dev Glassmorphic Micro-Cards */}
      {/* Floating Card 1: Top Right - Live Gate Pass Verification */}
      <motion.div
        className="pointer-events-none absolute -right-3 -top-6 z-20 hidden lg:block sm:pointer-events-auto"
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.95 }}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: 1,
                y: [0, -6, 0],
                transition: {
                  opacity: { duration: 0.5, delay: 0.3 },
                  y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                },
              }
        }
      >
        <div className="hero-glass-card rounded-2xl p-4 shadow-xl max-w-xs transition-transform duration-300 hover:scale-102">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              Gate Event Verified
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Just now</span>
          </div>
          <p className="mt-2 text-supporting font-semibold text-[var(--nestora-forest)]">
            Priya Sharma — Bed 304-B
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-caption text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Biometric Turnstile #2 · In-Time Verified</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Card 2: Bottom Left - Financial Reconciliation Velocity */}
      <motion.div
        className="pointer-events-none absolute -left-4 -bottom-6 z-20 hidden lg:block sm:pointer-events-auto"
        initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.95 }}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: 1,
                y: [0, 6, 0],
                transition: {
                  opacity: { duration: 0.5, delay: 0.4 },
                  y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
                },
              }
        }
      >
        <div className="hero-glass-card rounded-2xl p-4 shadow-xl max-w-xs transition-transform duration-300 hover:scale-102">
          <div className="flex items-center justify-between gap-3">
            <span className="text-caption font-semibold text-muted-foreground">
              Fee Recovery Velocity
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nestora-sage-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--nestora-forest)]">
              <TrendingUp className="size-3 text-[var(--nestora-sage)]" />
              +18.4%
            </span>
          </div>
          <p className="mt-1.5 text-h4 font-bold tabular-nums text-[var(--nestora-forest)]">
            ₹18.4 Lakhs
          </p>
          <p className="mt-0.5 text-caption text-muted-foreground">
            96.4% on-time fee recovery this academic cycle
          </p>
        </div>
      </motion.div>

      <figcaption className="mt-4 text-center text-caption text-muted-foreground">
        Interactive live workspace preview — select tabs above to inspect individual modules.
      </figcaption>
    </figure>
  );
}
