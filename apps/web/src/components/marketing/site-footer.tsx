'use client';

import { ArrowUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { footerBrand, footerColumns } from '@/components/marketing/landing/footer-content';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { cn } from '@/lib/utils';

const currentYear = new Date().getFullYear();

function FooterLinkList({ links }: { links: readonly { label: string; href: string }[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <Link
            href={link.href}
            className={cn(
              'inline-flex min-h-10 items-center text-supporting text-[var(--nestora-nav-muted)] transition-colors duration-200',
              'hover:text-[var(--nestora-forest)]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]',
            )}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MarketingSiteFooter() {
  const scrollToTop = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  return (
    <footer className="border-t border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_32%,var(--nestora-white))]">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid min-w-0 gap-12 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="min-w-0 lg:col-span-4 xl:col-span-4">
            <Link
              href="/"
              className="group inline-flex max-w-sm items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]"
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--nestora-sage-muted)] bg-card shadow-sm">
                <Image
                  src="/images/nestora-mark.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="size-7 object-contain"
                  unoptimized
                />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-h4 font-semibold text-[var(--nestora-forest)]">
                  {NESTORA_BRAND_NAME}
                </span>
                <span className="mt-0.5 block text-caption text-[var(--nestora-nav-muted)]">
                  University hostel management
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-pretty text-supporting leading-relaxed text-[var(--nestora-nav-muted)]">
              {footerBrand.description}
            </p>
            <p className="mt-4 text-caption font-medium text-[var(--nestora-tan)]">
              {footerBrand.tagline}
            </p>
          </div>

          <nav
            className="grid min-w-0 grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8 lg:gap-8 xl:col-span-8"
            aria-label="Footer"
          >
            {footerColumns.map((column) => (
              <div key={column.id} className="min-w-0">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-forest)]">
                  {column.title}
                </h3>
                <FooterLinkList links={column.links} />
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--nestora-sage-muted)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-[var(--nestora-nav-muted)]">
            © {currentYear} {NESTORA_BRAND_NAME}. All rights reserved.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-[var(--nestora-sage-muted)] bg-card px-4 text-caption font-semibold text-[var(--nestora-forest)] sm:self-auto',
              'transition-[border-color,background-color,transform] duration-200 hover:border-[var(--nestora-sage)] hover:bg-[color-mix(in_oklch,var(--nestora-cream)_50%,var(--card))]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]',
            )}
          >
            Back to top
            <ArrowUp className="size-3.5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </footer>
  );
}
