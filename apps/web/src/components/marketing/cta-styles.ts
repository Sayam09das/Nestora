import { cn } from '@/lib/utils';

/** Forest pill primary CTA (marketing reference: deep green, white label, flat). */
export const nestoraPrimaryCtaClasses = cn(
  'nestora-cta-primary inline-flex shrink-0 items-center justify-center gap-2',
  'rounded-full border border-transparent',
  'bg-[var(--nestora-forest)] text-white',
  'font-semibold shadow-none',
  'outline-none select-none',
  'transition-[transform,background-color,opacity] duration-200 ease-out',
  'hover:bg-[color-mix(in_oklch,var(--nestora-forest),white_12%)] hover:text-white',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_13%,transparent)]',
  'active:opacity-[0.92] motion-reduce:active:opacity-100',
);

export const nestoraSecondaryCtaClasses = cn(
  'inline-flex shrink-0 items-center justify-center gap-2',
  'rounded-full border border-transparent',
  'bg-secondary text-[color:var(--nestora-forest)]',
  'font-semibold shadow-none',
  'outline-none select-none',
  'transition-[transform,background-color,border-color,color,opacity] duration-200 ease-out',
  'hover:bg-[color-mix(in_oklch,var(--secondary),var(--nestora-forest)_8%)]',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_13%,transparent)]',
  'active:opacity-[0.92] motion-reduce:active:opacity-100',
);
