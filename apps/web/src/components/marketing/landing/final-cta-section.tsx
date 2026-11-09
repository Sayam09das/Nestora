'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, Clock, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { nestoraGoldCtaClasses, nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { finalCtaCopy } from '@/components/marketing/landing/final-cta-content';
import { FinalCtaPreview } from '@/components/marketing/landing/final-cta-preview';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const revealEase = [0.22, 1, 0.36, 1] as const;

export function FinalCtaSection() {
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

      gsap.from('[data-final-cta]', {
        opacity: 0,
        y: 24,
        duration: 0.62,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="get-started"
      className="section-final-cta relative scroll-mt-24 overflow-hidden border-t border-[var(--nestora-sage-muted)]"
      aria-labelledby="final-cta-heading"
    >
      {/* 21st.dev Ambient Background Glow */}
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 -z-10 h-72 w-full max-w-4xl -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--nestora-sage) 30%, transparent), color-mix(in srgb, var(--nestora-tan) 15%, transparent), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-x-14 xl:gap-x-20">
          <div data-final-cta className="min-w-0 lg:col-span-6">
            <p className="text-label font-bold uppercase tracking-[0.16em] text-[var(--nestora-tan)]">
              {finalCtaCopy.eyebrow}
            </p>
            <h2
              id="final-cta-heading"
              className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[2.25rem] sm:leading-[1.15]"
            >
              {finalCtaCopy.title}
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
              {finalCtaCopy.description}
            </p>

            <p
              className="mt-4 h-1 w-16 rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_70%,var(--nestora-forest))]"
              aria-hidden
            />

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: revealEase }}
                className="w-full sm:w-auto"
              >
                <Link
                  href={finalCtaCopy.primaryCta.href}
                  prefetch={false}
                  className={cn(
                    nestoraPrimaryCtaClasses,
                    'h-12 w-full px-8 text-body text-white sm:w-auto shadow-md',
                  )}
                >
                  <span>{finalCtaCopy.primaryCta.label}</span>
                  <ArrowRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                </Link>
              </motion.div>

              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: revealEase }}
                className="w-full sm:w-auto"
              >
                <Link
                  href={finalCtaCopy.secondaryCta.href}
                  className={cn(nestoraGoldCtaClasses, 'h-12 w-full px-7 text-body sm:w-auto')}
                >
                  <LayoutDashboard className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                  <span>{finalCtaCopy.secondaryCta.label}</span>
                </Link>
              </motion.div>
            </div>

            {/* Micro-guarantees Row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-[var(--nestora-nav-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-[var(--nestora-tan)]" aria-hidden />
                Deploy in under 48 hours
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                Full institutional support
              </span>
            </div>
          </div>

          <div data-final-cta className="min-w-0 lg:col-span-6 lg:justify-self-end w-full">
            <FinalCtaPreview className="w-full max-w-lg lg:max-w-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
