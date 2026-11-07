'use client';

import { Reveal, SectionShell } from '@/components/marketing/landing/motion';
import { featureItems } from '@/components/marketing/landing/content';
import { cn } from '@/lib/utils';

export function FeaturesSection() {
  return (
    <SectionShell id="features" className="bg-[color-mix(in_oklch,var(--background),var(--muted)_35%)]">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <p className="text-label font-medium text-primary">Product capabilities</p>
          <h2 id="features-heading" className="mt-2 max-w-2xl text-h2 font-semibold text-foreground">
            Everything hostels run on, in one system
          </h2>
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">
            From allocation to attendance and fees, modules share the same records so teams do not
            reconcile conflicting spreadsheets.
          </p>
        </Reveal>
        <ul className="mt-12 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className={cn(
                  'min-w-0',
                  feature.emphasis === 'wide' && 'md:col-span-2 lg:col-span-2',
                )}
              >
                <Reveal delay={(index % 3) * 0.05}>
                  <article
                    className={cn(
                      'group flex h-full min-w-0 flex-col gap-4 rounded-md border border-border bg-card p-5 shadow-nestora transition-[border-color,box-shadow] duration-200 sm:flex-row sm:items-start',
                      'hover:border-[color-mix(in_oklch,var(--primary)_35%,var(--border))] hover:shadow-nestora-md motion-reduce:transition-none',
                      feature.emphasis === 'wide' && 'lg:p-6',
                    )}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-h4 font-semibold text-foreground">{feature.title}</h3>
                      <p className="mt-2 text-supporting text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionShell>
  );
}
