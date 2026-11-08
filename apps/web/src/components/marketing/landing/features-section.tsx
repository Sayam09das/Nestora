'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

import { FeaturePreview } from '@/components/marketing/landing/feature-preview';
import {
  type FeatureModule,
  featuresCopy,
  primaryModules,
  supportModules,
} from '@/components/marketing/landing/features-content';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const revealEase = [0.22, 1, 0.36, 1] as const;

type FeatureBlockProps = {
  module: FeatureModule;
  tier: 'primary' | 'support';
  reduceMotion: boolean | null;
};

function FeatureBlock({ module, tier, reduceMotion }: FeatureBlockProps) {
  const Icon = module.icon;
  const isPrimary = tier === 'primary';

  return (
    <motion.article
      data-feature-block
      className={cn(
        'group relative flex min-w-0 flex-col border-border transition-[border-color,background-color] duration-200',
        isPrimary
          ? 'rounded-xl border bg-card p-6 sm:p-7 lg:p-8'
          : 'rounded-lg border border-transparent border-b py-5 sm:border-b-0 sm:border-l sm:py-0 sm:pl-6',
        isPrimary &&
          'hover:border-[color-mix(in_oklch,var(--primary)_28%,var(--border))] hover:bg-[color-mix(in_oklch,var(--card)_96%,var(--nestora-sage-light))]',
        !isPrimary &&
          'sm:min-h-[11rem] hover:border-l-[color-mix(in_oklch,var(--primary)_35%,var(--border))]',
      )}
      whileHover={reduceMotion ? undefined : { y: isPrimary ? -3 : -2 }}
      transition={{ duration: 0.22, ease: revealEase }}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-md border border-border bg-[color-mix(in_oklch,var(--muted)_70%,var(--card))] text-primary',
            isPrimary ? 'size-11' : 'size-9',
          )}
        >
          <Icon className={isPrimary ? 'size-5' : 'size-4'} aria-hidden strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn('font-semibold text-[var(--nestora-forest)]', isPrimary ? 'text-h4' : 'text-label')}>
            {module.title}
          </h3>
          <ul className={cn('mt-3 space-y-1.5 text-muted-foreground', isPrimary ? 'text-supporting' : 'text-caption')}>
            {module.points.map((point) => (
              <li key={point} className="flex gap-2 text-pretty">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {isPrimary ? <FeaturePreview kind={module.preview} /> : null}
    </motion.article>
  );
}

export function FeaturesSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      gsap.from('[data-feature-block]', {
        opacity: 0,
        y: 22,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="scroll-mt-24 bg-background"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          className="max-w-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: revealEase }}
        >
          <p className="text-label font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)]">
            {featuresCopy.eyebrow}
          </p>
          <h2
            id="features-heading"
            className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)]"
          >
            {featuresCopy.title}
          </h2>
          <p className="mt-4 text-pretty text-body leading-relaxed text-muted-foreground">
            {featuresCopy.description}
          </p>
        </motion.div>

        <div className="mt-12 grid min-w-0 gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          <div className="grid min-w-0 gap-6 lg:col-span-7 lg:grid-cols-1">
            {primaryModules.slice(0, 2).map((module) => (
              <FeatureBlock key={module.id} module={module} tier="primary" reduceMotion={reduceMotion} />
            ))}
          </div>
          <div className="min-w-0 lg:col-span-5">
            {primaryModules[2] ? (
              <FeatureBlock module={primaryModules[2]} tier="primary" reduceMotion={reduceMotion} />
            ) : null}
          </div>
        </div>

        <motion.div
          className="mt-10 border-t border-border pt-10 lg:mt-14"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={reduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <p className="text-label font-medium text-muted-foreground">More modules on the same platform</p>
          <ul className="mt-6 grid min-w-0 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {supportModules.map((module) => (
              <li key={module.id} className="min-w-0">
                <FeatureBlock module={module} tier="support" reduceMotion={reduceMotion} />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
