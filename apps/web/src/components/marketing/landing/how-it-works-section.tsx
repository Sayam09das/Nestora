'use client';

import { Reveal, SectionShell } from '@/components/marketing/landing/motion';
import { howItWorksSteps } from '@/components/marketing/landing/content';

export function HowItWorksSection() {
  return (
    <SectionShell id="how-it-works" className="bg-background">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <h2 id="how-heading" className="text-h2 font-semibold text-foreground">
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">
            Go from setup to daily operations in four clear steps. Each phase builds on structured
            data your team already needs.
          </p>
        </Reveal>
        <ol className="mt-12 grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <li key={step.step} className="min-w-0">
              <Reveal delay={index * 0.08}>
                <article className="relative flex h-full flex-col border-l-2 border-primary pl-5">
                  <span className="text-caption font-semibold tabular-nums text-primary">
                    Step {step.step}
                  </span>
                  <h3 className="mt-2 text-h4 font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-supporting text-muted-foreground">{step.description}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
