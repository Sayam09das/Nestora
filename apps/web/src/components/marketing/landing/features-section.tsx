'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { FeaturePreview } from '@/components/marketing/landing/feature-preview';
import {
  type FeatureModule,
  featuresCopy,
  primaryModules,
} from '@/components/marketing/landing/features-content';
import { SupportModulesSection } from '@/components/marketing/landing/support-modules-section';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const revealEase = [0.22, 1, 0.36, 1] as const;

type FeatureBlockProps = {
  module: FeatureModule;
  reduceMotion: boolean | null;
};

function PrimaryFeatureBlock({ module, reduceMotion }: FeatureBlockProps) {
  const Icon = module.icon;

  return (
    <motion.article
      data-feature-primary
      className={cn(
        'group relative flex h-full min-w-0 flex-col rounded-xl border border-border bg-card p-6 transition-[border-color,background-color] duration-200 sm:p-7 lg:p-8',
        'hover:border-[color-mix(in_oklch,var(--primary)_28%,var(--border))] hover:bg-[color-mix(in_oklch,var(--card)_96%,var(--nestora-sage-light))]',
      )}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.22, ease: revealEase }}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-[color-mix(in_oklch,var(--muted)_70%,var(--card))] text-primary">
            <Icon className="size-5" aria-hidden strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-h4 font-semibold text-[var(--nestora-forest)]">{module.title}</h3>
            <ul className="mt-3 space-y-1.5 text-supporting text-muted-foreground">
              {module.points.map((point) => (
                <li key={point} className="flex gap-2 text-pretty">
                  <span
                    className="mt-2 size-1 shrink-0 rounded-full bg-[var(--nestora-sage)]"
                    aria-hidden
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <FeaturePreview kind={module.preview} className="mt-6 shrink-0" />
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

      gsap.from('[data-feature-primary]', {
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

        <div className="mt-12 grid min-w-0 grid-cols-1 gap-6 auto-rows-fr lg:mt-14 lg:grid-cols-2 lg:gap-8">
          {primaryModules.map((module) => (
            <PrimaryFeatureBlock key={module.id} module={module} reduceMotion={reduceMotion} />
          ))}
        </div>

        <SupportModulesSection />
      </div>
    </section>
  );
}
