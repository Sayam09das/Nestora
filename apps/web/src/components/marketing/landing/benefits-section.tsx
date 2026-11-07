'use client';

import { Check } from 'lucide-react';

import { Reveal, SectionShell } from '@/components/marketing/landing/motion';
import { benefitBullets } from '@/components/marketing/landing/content';

export function BenefitsSection() {
  return (
    <SectionShell className="bg-background">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <Reveal>
            <h2 id="benefits-heading" className="text-h2 font-semibold text-foreground">
              Why teams switch to Nestora
            </h2>
            <p className="mt-3 text-body text-muted-foreground">
              Replace fragmented tools with one product-shaped workflow. Benefits come from
              structure, not from promised ROI figures.
            </p>
          </Reveal>
          <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
            {benefitBullets.map((bullet, index) => (
              <li key={bullet}>
                <Reveal delay={index * 0.04}>
                  <span className="flex min-w-0 gap-3 rounded-md border border-border bg-card px-4 py-3 text-body text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0 break-words">{bullet}</span>
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
