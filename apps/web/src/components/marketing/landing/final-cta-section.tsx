'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { nestoraPrimaryCtaClasses, nestoraSecondaryCtaClasses } from '@/components/marketing/cta-styles';
import { Reveal, SectionShell } from '@/components/marketing/landing/motion';
import { cn } from '@/lib/utils';

export function FinalCtaSection() {
  return (
    <SectionShell className="border-b-0 bg-[var(--nestora-forest)] text-white">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="cta-heading" className="text-h2 font-semibold text-white">
              Ready to run your hostel in one place?
            </h2>
            <p className="mt-4 text-body text-[color-mix(in_oklch,white_85%,var(--nestora-forest))]">
              Start with registration, invite your team, and shape daily operations around real
              hostel data.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  nestoraPrimaryCtaClasses,
                  'h-11 min-h-11 bg-white px-7 text-[var(--nestora-forest)] hover:bg-[color-mix(in_oklch,white_92%,var(--nestora-sage))] hover:text-[var(--nestora-forest)]',
                )}
              >
                Get started
                <ArrowUpRight className="size-4 shrink-0 text-current" aria-hidden strokeWidth={2.25} />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  nestoraSecondaryCtaClasses,
                  'h-11 min-h-11 border-white/30 bg-transparent px-7 text-white hover:bg-white/10',
                )}
              >
                Talk to us
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
