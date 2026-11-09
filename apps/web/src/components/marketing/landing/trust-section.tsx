'use client';

import { Building2, ClipboardList, Layers, Wallet } from 'lucide-react';

import { Reveal, SectionShell } from '@/components/marketing/landing/motion';
import { trustHighlights } from '@/components/marketing/landing/content';

const icons = [Building2, Layers, ClipboardList, Wallet] as const;

export function TrustSection() {
  return (
    <SectionShell className="bg-background">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <h2
            id="trust-heading"
            className="max-w-2xl text-h2 font-semibold text-foreground"
          >
            Built for everyday hostel operations
          </h2>
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">
            Nestora is hostel management software for universities: one place to coordinate
            people, rooms, and money without inventing metrics we cannot verify.
          </p>
        </Reveal>
        <ul className="mt-12 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustHighlights.map((item, index) => {
            const Icon = icons[index] ?? Building2;
            return (
              <li key={item.title}>
                <Reveal delay={index * 0.06}>
                  <article className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-5 shadow-nestora">
                    <span className="flex size-10 items-center justify-center rounded-md border border-border bg-muted text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="text-h4 font-semibold text-foreground">{item.title}</h3>
                    <p className="text-supporting text-muted-foreground">{item.description}</p>
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
