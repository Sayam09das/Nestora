'use client';

import { useRef } from 'react';

import {
  benefitItems,
  benefitsCopy,
  type BenefitTextItem,
} from '@/components/marketing/landing/benefits-content';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

function BenefitTextEntry({ benefit }: { benefit: BenefitTextItem }) {
  const featured = benefit.featured;

  return (
    <article
      data-benefit-item
      className={cn(
        'grid min-w-0 grid-cols-[3.25rem_1fr] gap-x-6 text-pretty sm:grid-cols-[4.5rem_1fr] sm:gap-x-10',
        featured && 'sm:grid-cols-[5rem_1fr]',
      )}
    >
      <p
        className={cn(
          'pt-0.5 font-bold tabular-nums tracking-[0.12em] text-[var(--nestora-tan)]',
          featured ? 'text-label sm:text-body' : 'text-[11px] sm:text-label',
        )}
      >
        {benefit.order}
      </p>
      <div className="min-w-0">
        <h3
          className={
            featured
              ? 'text-h4 font-semibold text-[var(--nestora-forest)] sm:text-h3'
              : 'text-h4 font-semibold text-[var(--nestora-forest)]'
          }
        >
          {benefit.title}
        </h3>
        <p className="mt-3 max-w-prose text-supporting leading-relaxed text-[var(--nestora-nav-muted)] sm:text-body">
          {benefit.summary}
        </p>
      </div>
    </article>
  );
}

function BenefitColumn({ items }: { items: BenefitTextItem[] }) {
  return (
    <div className="flex min-w-0 flex-col divide-y divide-[var(--nestora-sage-muted)]">
      {items.map((benefit) => (
        <div key={benefit.id} className="py-10 first:pt-0 last:pb-0 sm:py-12">
          <BenefitTextEntry benefit={benefit} />
        </div>
      ))}
    </div>
  );
}

export function BenefitsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leadColumn = benefitItems.slice(0, 3);
  const trailColumn = benefitItems.slice(3);

  useGSAP(
    () => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      gsap.from('[data-benefit-intro]', {
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

      gsap.from('[data-benefit-item]', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '[data-benefit-stage]',
          start: 'top 88%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="section-benefits-band scroll-mt-24 border-t"
      aria-labelledby="benefits-heading"
    >
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid min-w-0 gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <div data-benefit-intro className="lg:col-span-5">
            <p className="text-label font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)]">
              {benefitsCopy.eyebrow}
            </p>
            <h2
              id="benefits-heading"
              className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)]"
            >
              {benefitsCopy.title}
            </h2>
          </div>
          <p
            data-benefit-intro
            className="max-w-xl text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)] lg:col-span-7"
          >
            {benefitsCopy.description}
          </p>
        </div>

        <div
          data-benefit-stage
          className="mt-12 border-t border-[var(--nestora-sage-muted)] pt-12 sm:pt-14 lg:mt-16 lg:pt-16"
        >
          <div className="grid min-w-0 gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-0 xl:gap-x-28">
            <BenefitColumn items={leadColumn} />
            <BenefitColumn items={trailColumn} />
          </div>
        </div>

        <p
          data-benefit-intro
          className="mt-12 max-w-prose text-pretty text-caption leading-relaxed text-[var(--nestora-nav-muted)] sm:mt-14"
        >
          {benefitsCopy.footnote}
        </p>
      </div>
    </section>
  );
}
