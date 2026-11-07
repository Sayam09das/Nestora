'use client';

import { Reveal, SectionShell } from '@/components/marketing/landing/motion';
import { roleCards } from '@/components/marketing/landing/content';

export function RolesSection() {
  return (
    <SectionShell id="roles" className="bg-[color-mix(in_oklch,var(--background),var(--muted)_35%)]">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <h2 id="roles-heading" className="text-h2 font-semibold text-foreground">
            Role-based solutions
          </h2>
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">
            Each role sees a focused workspace. Access is designed for administrators, wardens,
            staff, and students.
          </p>
        </Reveal>
        <ul className="mt-12 grid min-w-0 gap-4 sm:grid-cols-2">
          {roleCards.map((role, index) => (
            <li key={role.title}>
              <Reveal delay={index * 0.06}>
                <article className="h-full rounded-md border border-border bg-card p-6 shadow-nestora">
                  <h3 className="text-h4 font-semibold text-foreground">{role.title}</h3>
                  <p className="mt-3 text-body text-muted-foreground">{role.description}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
