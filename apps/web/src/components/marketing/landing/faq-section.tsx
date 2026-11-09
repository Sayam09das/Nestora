'use client';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Clock, HelpCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { nestoraGoldCtaClasses } from '@/components/marketing/cta-styles';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { FaqAccordion } from '@/components/marketing/landing/faq-accordion';
import { faqCopy, faqItems } from '@/components/marketing/landing/faq-content';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      gsap.from('[data-faq-intro]', {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          once: true,
        },
      });

      gsap.from('[data-faq-item]', {
        opacity: 0,
        y: 14,
        duration: 0.45,
        stagger: 0.04,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '[data-faq-accordion]',
          start: 'top 86%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="scroll-mt-24 border-t border-[var(--nestora-sage-muted)] bg-background"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-x-14 xl:gap-x-20">
          {/* Left Column: Heading, description & institutional support prompt */}
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:max-w-md">
            <div data-faq-intro>
              <p className="text-label font-bold uppercase tracking-[0.16em] text-[var(--nestora-tan)]">
                {faqCopy.eyebrow}
              </p>
              <h2
                id="faq-heading"
                className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[2.25rem] sm:leading-[1.15]"
              >
                {faqCopy.title}
              </h2>
              <p className="mt-4 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
                {faqCopy.description}
              </p>
            </div>

            {/* Support / Contact Card */}
            <div
              data-faq-intro
              className="mt-8 rounded-2xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_srgb,var(--nestora-white)_80%,var(--nestora-cream))] p-6 sm:p-7 shadow-[0_2px_12px_rgba(12,59,46,0.03)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--nestora-sage-light)] text-[var(--nestora-forest)]">
                  <HelpCircle className="size-4" strokeWidth={2} aria-hidden />
                </span>
                <p className="text-label font-semibold text-[var(--nestora-forest)]">
                  Need Custom Assistance?
                </p>
              </div>

              <p className="mt-3 text-pretty text-supporting leading-relaxed text-[var(--nestora-nav-muted)]">
                {faqCopy.supportPrompt}
              </p>

              <Link
                href={faqCopy.ctaHref}
                className={cn(
                  nestoraGoldCtaClasses,
                  'group mt-6 h-11 w-full justify-between px-5 text-supporting sm:w-auto sm:justify-center sm:gap-3',
                )}
              >
                <span>{faqCopy.ctaLabel}</span>
                <ArrowUpRight
                  className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>

              <div className="mt-5 border-t border-[var(--nestora-sage-muted)] pt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-[var(--nestora-nav-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-[var(--nestora-tan)]" aria-hidden />
                  Avg response &lt; 24h
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                  Dedicated institutional setup
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div data-faq-accordion className="min-w-0 lg:col-span-7">
            <FaqAccordion items={faqItems} defaultValue={['what-is']} />
          </div>
        </div>
      </div>
    </section>
  );
}
