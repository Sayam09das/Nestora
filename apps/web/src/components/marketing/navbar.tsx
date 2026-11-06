'use client';

import './navbar.css';

import { ArrowRight, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const navLinkClass =
  'text-label font-medium tracking-normal text-foreground/90 transition-[color,opacity] duration-150 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]';

export function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="marketing-nav sticky top-0 z-40 w-full border-b border-border bg-[color-mix(in_srgb,var(--background)_96%,transparent)]">
      <div className="relative mx-auto flex h-14 max-w-[var(--container-marketing)] items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="flex min-w-0 max-w-[min(100%,12rem)] items-center gap-2 sm:gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          >
            <span className="relative size-8 shrink-0 overflow-hidden rounded-md sm:size-9 min-w-0">
              <Image
                src="/images/image.png"
                alt="Nestora"
                width={36}
                height={36}
                className="size-8 object-contain sm:size-9"
              />
            </span>
            <span className="min-w-0 truncate text-h3 font-semibold text-foreground">Nestora</span>
          </Link>
        </div>

        <nav
          aria-label="Main"
          className="absolute left-1/2 hidden min-w-0 -translate-x-1/2 md:block"
        >
          <ul className="flex items-center gap-5 lg:gap-7">
            {navItems.map((item) => (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  className={cn(navLinkClass, 'block min-w-0 whitespace-nowrap')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          <Link href="/login" className={cn(navLinkClass, 'hidden sm:inline')} prefetch={false}>
            Login
          </Link>
          <Button
            size="default"
            nativeButton={false}
            render={<Link href="/register" prefetch={false} />}
            className="marketing-nav-cta relative isolate overflow-hidden hidden h-10 min-h-10 gap-2 px-4 text-body font-medium sm:inline-flex hover:-translate-y-px hover:shadow-[0_6px_22px_-6px_color-mix(in_oklch,var(--primary)_42%,transparent)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none active:translate-y-px motion-reduce:active:translate-y-0"
          >
            <span className="relative z-[1] flex min-w-0 items-center gap-2">
              Get started
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover/button:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/button:translate-x-0"
                aria-hidden
              />
            </span>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              nativeButton={false}
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="md:hidden transition-[background-color,border-color,opacity,transform] duration-150 motion-reduce:transition-none"
                  aria-label="Open menu"
                >
                  <Menu className="size-4" aria-hidden />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[min(100%,20rem)] sm:max-w-sm" showCloseButton>
              <SheetHeader className="border-b border-border">
                <SheetTitle className="font-sans text-sm font-medium normal-case tracking-normal text-foreground">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-0.5 p-4">
                {navItems.map((item) => (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={
                      <Link
                        href={item.href}
                        prefetch={item.href.startsWith('/#') ? false : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(navLinkClass, 'rounded-md px-2 py-2.5')}
                      >
                        {item.label}
                      </Link>
                    }
                  />
                ))}
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/login"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className={cn(navLinkClass, 'rounded-md px-2 py-2.5')}
                    >
                      Login
                    </Link>
                  }
                />
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/register"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: 'default', size: 'default' }),
                        'marketing-nav-cta relative isolate overflow-hidden mt-3 h-10 min-h-10 justify-center gap-2 px-4 text-body font-medium hover:-translate-y-px hover:shadow-[0_6px_22px_-6px_color-mix(in_oklch,var(--primary)_42%,transparent)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none active:translate-y-px motion-reduce:active:translate-y-0',
                      )}
                    >
                      <span className="relative z-[1] flex min-w-0 items-center gap-2">
                        Get started
                        <ArrowRight
                          className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover/button:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/button:translate-x-0"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  }
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
