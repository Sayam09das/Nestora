'use client';

import { Accordion } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';

import type { FaqItem } from '@/components/marketing/landing/faq-content';
import { cn } from '@/lib/utils';

type FaqAccordionProps = {
  items: FaqItem[];
  defaultValue?: string[];
  className?: string;
};

export function FaqAccordion({ items, defaultValue = ['what-is'], className }: FaqAccordionProps) {
  return (
    <Accordion.Root
      className={cn(
        'min-w-0 divide-y divide-[var(--nestora-sage-muted)] border-y border-[var(--nestora-sage-muted)]',
        className,
      )}
      defaultValue={defaultValue}
      multiple={false}
    >
      {items.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          data-faq-item
          className="group/faq-item transition-colors duration-200"
        >
          <Accordion.Header className="m-0 flex">
            <Accordion.Trigger
              className={cn(
                'group/faq-trigger flex w-full min-h-[3.75rem] items-start gap-4 py-5 text-left outline-none sm:min-h-16 sm:gap-6 sm:py-6',
                'transition-colors duration-200',
                'focus-visible:ring-2 focus-visible:ring-[var(--nestora-sage)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 w-8 shrink-0 font-mono text-[11px] font-bold tabular-nums tracking-[0.14em] text-[var(--nestora-tan)] sm:w-10 sm:text-label',
                  'transition-colors duration-200',
                  'group-hover/faq-item:text-[var(--nestora-forest)] group-aria-expanded/faq-trigger:text-[var(--nestora-forest)]',
                )}
                aria-hidden
              >
                {item.order}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 text-supporting font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-body',
                  'transition-colors duration-200',
                  'group-hover/faq-item:text-[var(--nestora-forest-light)]',
                )}
              >
                {item.question}
              </span>
              <span
                className={cn(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                  'border border-[var(--nestora-sage-muted)] bg-[var(--card)] text-[var(--nestora-forest)]',
                  'transition-[transform,background-color,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  'motion-reduce:transition-none',
                  'group-hover/faq-item:border-[var(--nestora-sage)] group-hover/faq-item:bg-[var(--nestora-cream)]',
                  'group-aria-expanded/faq-trigger:rotate-180 group-aria-expanded/faq-trigger:border-[var(--nestora-forest)] group-aria-expanded/faq-trigger:bg-[var(--nestora-forest)] group-aria-expanded/faq-trigger:text-[var(--nestora-cream)]',
                )}
                aria-hidden
              >
                <ChevronDown className="size-4" strokeWidth={2} />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="faq-accordion-panel">
            <div className="pb-6 pl-12 pr-4 sm:pb-7 sm:pl-16 sm:pr-8">
              <p className="max-w-prose text-pretty text-supporting leading-relaxed text-[var(--nestora-nav-muted)] sm:text-body">
                {item.answer}
              </p>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
