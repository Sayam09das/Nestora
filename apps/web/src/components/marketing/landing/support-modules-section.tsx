'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SafariModulePreview } from '@/components/marketing/landing/safari-module-preview';
import {
  supportModuleDetails,
  supportModules,
  type FeatureModule,
} from '@/components/marketing/landing/features-content';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const revealEase = [0.22, 1, 0.36, 1] as const;
const AUTO_INTERVAL_MS = 5200;

const supportCopy = {
  eyebrow: 'Same platform',
  title: 'More modules on one record',
  description:
    'Five more areas connect to the same student and room records. The tour runs on its own—hover or select a module to pause.',
} as const;

function nextModuleId(currentId: string): string {
  const index = supportModules.findIndex((m) => m.id === currentId);
  if (index < 0) {
    return supportModules[0]?.id ?? currentId;
  }
  return supportModules[(index + 1) % supportModules.length]?.id ?? currentId;
}

function TourStatusRail({
  activeIndex,
  activeId,
  autoPlay,
  reduceMotion,
}: {
  activeIndex: number;
  activeId: string;
  autoPlay: boolean;
  reduceMotion: boolean | null;
}) {
  const stepCount = supportModules.length;

  return (
    <div
      className="flex min-w-0 flex-col gap-3"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={stepCount}
      aria-valuenow={activeIndex + 1}
      aria-label={`Module tour step ${activeIndex + 1} of ${stepCount}`}
    >
      <div className="flex gap-2">
        {supportModules.map((module, index) => {
          const isPast = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div key={module.id} className="relative min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--nestora-sage-muted)]">
                {isPast ? (
                  <span className="block h-full w-full bg-[var(--nestora-sage)]" aria-hidden />
                ) : null}
                {isCurrent && autoPlay && !reduceMotion ? (
                  <motion.span
                    key={`rail-${activeId}`}
                    className="block h-full bg-gradient-to-r from-[var(--nestora-sage)] to-[var(--nestora-forest-light)]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTO_INTERVAL_MS / 1000, ease: 'linear' }}
                    aria-hidden
                  />
                ) : null}
                {isCurrent && (!autoPlay || reduceMotion) ? (
                  <span className="block h-full w-full bg-[var(--nestora-forest)]" aria-hidden />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModuleDetailPanel({ module }: { module: FeatureModule }) {
  const Icon = module.icon;
  const detail = supportModuleDetails[module.id];

  return (
    <div className="grid min-h-0 min-w-0 lg:min-h-[22rem] lg:grid-cols-2 lg:items-stretch">
      <div className="flex min-w-0 flex-col justify-center gap-6 border-[var(--nestora-sage-muted)] p-6 sm:p-8 lg:border-r lg:p-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--nestora-forest)] text-[var(--nestora-white)]">
              <Icon className="size-4" aria-hidden strokeWidth={2} />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
              Hostel module
            </p>
          </div>
          <h3 className="mt-4 text-h4 font-semibold tracking-tight text-[var(--nestora-forest)] lg:text-h3">
            {module.title}
          </h3>
          {detail ? (
            <p className="mt-3 text-pretty text-supporting leading-relaxed text-[var(--nestora-nav-muted)] sm:text-body">
              {detail.summary}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 border-t border-[var(--nestora-sage-muted)] pt-6">
          <p className="text-label font-semibold text-[var(--nestora-forest)]">Includes</p>
          <ul className="mt-3 space-y-2">
            {module.points.map((point) => (
              <li key={point} className="flex gap-2.5 text-supporting text-[var(--nestora-ink)]">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
                <span className="text-pretty">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="flex min-h-full min-w-0 flex-col bg-[var(--nestora-sage-light)] p-6 sm:p-8"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 90% 60% at 50% 0%, color-mix(in oklch, var(--nestora-sage) 16%, transparent), transparent)',
        }}
      >
        <div className="shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--nestora-forest)]">
            Product preview
          </p>
          <p className="mt-1 text-caption text-[var(--nestora-nav-muted)]">Illustrative screen — not live data.</p>
        </div>

        <div className="relative mt-5 flex flex-1 flex-col justify-center">
          <SafariModulePreview module={module} />
        </div>
      </div>
    </div>
  );
}

export function SupportModulesSection() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(supportModules[0]?.id ?? 'attendance');
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const activeModule = supportModules.find((m) => m.id === activeId) ?? supportModules[0];
  const activeIndex = useMemo(
    () => Math.max(0, supportModules.findIndex((m) => m.id === activeId)),
    [activeId],
  );

  const selectModule = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const autoPlay = inView && !paused && !reduceMotion;

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveId((current) => nextModuleId(current));
    }, AUTO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [autoPlay, activeId]);

  useGSAP(
    () => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      gsap.from('[data-support-shell]', {
        y: 20,
        duration: 0.65,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    },
    { scope: rootRef },
  );

  if (!activeModule) {
    return null;
  }

  return (
    <motion.div
      ref={rootRef}
      className="mt-16 min-w-0 border-t border-[var(--nestora-sage-muted)] bg-[var(--nestora-cream)] pt-14 lg:mt-20 lg:pt-16"
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, ease: revealEase }}
    >
      <motion.div
        className="max-w-2xl"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45, ease: revealEase }}
      >
        <p className="text-label font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)]">
          {supportCopy.eyebrow}
        </p>
        <h3 className="mt-3 text-balance text-h3 font-semibold tracking-tight text-[var(--nestora-forest)]">
          {supportCopy.title}
        </h3>
        <p className="mt-3 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
          {supportCopy.description}
        </p>
        <p className="sr-only">{supportModules.length} additional modules included with Nestora</p>
      </motion.div>

      <div
        ref={shellRef}
        data-support-shell
        className="mt-10 min-w-0 rounded-2xl border border-[var(--nestora-sage-muted)] bg-[var(--nestora-white)] p-6 shadow-[0_20px_50px_-36px_color-mix(in_oklch,var(--nestora-forest)_55%,transparent)] sm:p-8 lg:mt-12"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!shellRef.current?.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div className="grid min-w-0 gap-6 lg:grid-cols-12 lg:gap-x-8">
          <aside className="flex min-w-0 flex-col lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <header className="mb-6 flex min-h-[6.75rem] flex-col justify-end border-b border-[var(--nestora-sage-muted)] pb-6">
              <p
                className="text-caption font-semibold text-[var(--nestora-forest)]"
                id="support-module-nav-label"
              >
                Modules
              </p>
              <p className="mt-1 text-caption text-[var(--nestora-nav-muted)]" aria-live="polite">
                {reduceMotion
                  ? 'Manual selection'
                  : paused
                    ? 'Tour paused'
                    : inView
                      ? 'Auto tour running'
                      : 'Scroll section into view'}
              </p>
            </header>

            <ul
              className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-labelledby="support-module-nav-label"
            >
              {supportModules.map((module, index) => {
                const isActive = module.id === activeId;
                const Icon = module.icon;
                return (
                  <li key={module.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="support-module-panel"
                      id={`support-tab-${module.id}`}
                      onClick={() => selectModule(module.id)}
                      className={cn(
                        'relative flex w-full min-w-[12.5rem] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200 lg:min-w-0 lg:px-4 lg:py-3.5',
                        isActive
                          ? 'border-[var(--nestora-sage)] bg-[var(--nestora-sage-light)] shadow-[inset_3px_0_0_0_var(--nestora-forest)]'
                          : 'border-transparent bg-[var(--nestora-cream)] text-[var(--nestora-nav-muted)] hover:border-[var(--nestora-sage-muted)] hover:bg-[var(--nestora-sage-light)] hover:text-[var(--nestora-ink)]',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                          isActive
                            ? 'border-[var(--nestora-sage)] bg-[var(--nestora-white)] text-[var(--nestora-forest)]'
                            : 'border-[var(--nestora-sage-muted)] bg-[var(--nestora-white)]',
                        )}
                      >
                        <Icon className="size-4" aria-hidden strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-[10px] font-semibold uppercase tracking-wider',
                            isActive ? 'text-[var(--nestora-sage)]' : 'text-[var(--nestora-nav-muted)]',
                          )}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={cn(
                            'text-label font-semibold leading-snug',
                            isActive ? 'text-[var(--nestora-forest)]' : 'font-medium',
                          )}
                        >
                          {module.title}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="flex min-w-0 flex-col lg:col-span-8">
            <header className="mb-6 min-h-[6.75rem] border-b border-[var(--nestora-sage-muted)] pb-6">
              <div className="flex items-end justify-between gap-4">
                <motion.div key={activeModule.id} className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
                    Now viewing
                  </p>
                  <p className="mt-1 text-h4 font-semibold text-[var(--nestora-forest)]">{activeModule.title}</p>
                </motion.div>
                <p className="shrink-0 font-mono text-label font-semibold tabular-nums text-[var(--nestora-forest)]">
                  {String(activeIndex + 1).padStart(2, '0')}
                  <span className="text-[var(--nestora-nav-muted)]">
                    {' '}
                    / {String(supportModules.length).padStart(2, '0')}
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <TourStatusRail
                  activeIndex={activeIndex}
                  activeId={activeId}
                  autoPlay={autoPlay}
                  reduceMotion={reduceMotion}
                />
              </div>
            </header>

            <article
              id="support-module-panel"
              role="tabpanel"
              aria-labelledby={`support-tab-${activeModule.id}`}
              aria-live="polite"
              className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--nestora-sage-muted)] bg-[var(--nestora-white)]"
            >
            <motion.div
              key={activeModule.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: revealEase }}
            >
              <ModuleDetailPanel module={activeModule} />
            </motion.div>
            </article>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
