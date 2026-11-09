'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Building2, ChevronRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { cn } from '@/lib/utils';

import './navbar.css';

/** Placeholder until marketing finalizes the product name. */
export const NESTORA_BRAND_NAME = 'Nestora';

const navEase = [0.22, 1, 0.36, 1] as const;

const navItems = [
  { href: '/', label: 'Home', match: 'home' as const },
  { href: '/#features', label: 'Features', match: 'hash' as const },
  { href: '/#roles', label: 'Roles', match: 'hash' as const },
  { href: '/#benefits', label: 'Benefits', match: 'hash' as const },
  { href: '/#faq', label: 'FAQ', match: 'hash' as const },
  { href: '/about', label: 'About', match: 'path' as const },
  { href: '/contact', label: 'Contact', match: 'path' as const },
] as const;

const desktopNavList = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.14 },
  },
} as const;

const desktopNavItem = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: navEase },
  },
} as const;

const mobileMenuSpring = { type: 'spring', stiffness: 440, damping: 34, mass: 0.9 } as const;

const mobileMenuPanel = {
  hidden: { opacity: 0, y: 18, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: mobileMenuSpring,
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    transition: { duration: 0.2, ease: navEase },
  },
} as const;

const mobileNavList = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.042, delayChildren: 0.1 },
  },
} as const;

const mobileNavItem = {
  hidden: { opacity: 0, x: 14 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 520, damping: 32 },
  },
  exit: {
    opacity: 0,
    x: 6,
    transition: { duration: 0.16, ease: navEase },
  },
} as const;

const mobileNavFooter = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...mobileMenuSpring, delay: 0.22 },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.16, ease: navEase },
  },
} as const;

const MotionLink = motion.create(Link);

function useLocationHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return { pathname, hash };
}

function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

function isNavItemActive(item: (typeof navItems)[number], pathname: string, hash: string): boolean {
  if (item.match === 'path') {
    return pathname === item.href;
  }
  if (item.match === 'home') {
    return pathname === '/' && hash === '';
  }
  if (item.match === 'hash' && pathname === '/') {
    return hash === item.href.replace('/', '');
  }
  return false;
}

const navLinkFocus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)]';

type DesktopNavLinkProps = {
  item: (typeof navItems)[number];
  active: boolean;
};

function DesktopNavLink({ item, active }: DesktopNavLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li variants={desktopNavItem} className="relative min-w-0">
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative block min-w-0 whitespace-nowrap rounded-md px-2 py-1.5 text-label font-medium',
          'text-[color:var(--nestora-nav-muted)] transition-colors duration-200',
          'hover:text-foreground',
          active && 'text-foreground',
          navLinkFocus,
        )}
      >
        <span className="relative z-[1]">{item.label}</span>
        {active && !reduceMotion ? (
          <motion.span
            layoutId="nestora-nav-active"
            className="pointer-events-none absolute inset-x-2 -bottom-0.5 h-px bg-primary"
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          />
        ) : (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-2 -bottom-0.5 h-px origin-center scale-x-0 bg-primary opacity-0 transition-[transform,opacity] duration-200 ease-out',
              'group-hover:scale-x-100 group-hover:opacity-100 motion-reduce:transition-none',
              active && 'scale-x-100 opacity-100',
            )}
          />
        )}
      </Link>
    </motion.li>
  );
}

type MobileNavLinkProps = {
  item: (typeof navItems)[number];
  active: boolean;
  onNavigate: () => void;
};

type MobileMenuToggleProps = {
  open: boolean;
  menuId: string;
  onToggle: () => void;
};

function MobileMenuToggle({ open, menuId, onToggle }: MobileMenuToggleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={cn(
        'relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg md:hidden',
        open ? 'z-[120]' : 'z-[60]',
        'border border-border bg-card text-[var(--nestora-forest)] shadow-nestora',
        'transition-[background-color,border-color,box-shadow,color] duration-200 ease-out',
        'hover:border-[color-mix(in_oklch,var(--primary)_28%,var(--border))] hover:bg-muted hover:text-foreground hover:shadow-nestora-md',
        open &&
          'border-[color-mix(in_oklch,var(--primary)_35%,var(--border))] bg-muted text-foreground shadow-nestora-md',
        navLinkFocus,
      )}
      aria-expanded={open}
      aria-controls={menuId}
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onToggle}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
    >
      <span className="grid size-5 place-items-center overflow-visible" aria-hidden>
        {reduceMotion ? (
          open ? (
            <X className="size-5" strokeWidth={2.25} />
          ) : (
            <Menu className="size-5" strokeWidth={2.25} />
          )
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'close' : 'menu'}
              className="col-start-1 row-start-1 grid size-5 place-items-center"
              initial={{ opacity: 0, rotate: -88, scale: 0.82 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 88, scale: 0.82 }}
              transition={{ duration: 0.2, ease: navEase }}
            >
              {open ? (
                <X className="size-5" strokeWidth={2.25} />
              ) : (
                <Menu className="size-5" strokeWidth={2.25} />
              )}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </motion.button>
  );
}

function MobileNavLink({ item, active, onNavigate }: MobileNavLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li variants={mobileNavItem}>
      <Link
        href={item.href}
        prefetch={item.href.startsWith('/#') ? false : undefined}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl px-3.5 py-3',
          'text-[1.0625rem] font-medium leading-snug',
          'text-[color:var(--nestora-nav-muted)]',
          'transition-[background-color,color,box-shadow] duration-200',
          'hover:bg-[color-mix(in_srgb,var(--nestora-sage)_12%,var(--muted))] hover:text-foreground',
          active &&
            'bg-[color-mix(in_srgb,var(--nestora-sage)_16%,var(--muted))] text-foreground shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_12%,transparent)]',
          navLinkFocus,
        )}
      >
        {active ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-primary"
          />
        ) : null}
        <span className="relative z-[1] pl-0.5">{item.label}</span>
        <motion.span
          aria-hidden
          className={cn(
            'text-[color:var(--nestora-nav-muted)] transition-colors duration-200',
            'group-hover:text-primary',
            active && 'text-primary',
          )}
          initial={false}
          animate={reduceMotion ? undefined : { opacity: active ? 1 : 0.45 }}
          whileHover={reduceMotion ? undefined : { x: 2, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 28 }}
        >
          <ChevronRight className="size-4" strokeWidth={2.25} />
        </motion.span>
      </Link>
    </motion.li>
  );
}

export function MarketingNavbar() {
  const reduceMotion = useReducedMotion();
  const mobileMenuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const scrolled = useScrolled();
  const { pathname, hash } = useLocationHash();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobile();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeMobile, mobileOpen]);

  const headerMotion = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 1, y: 0, transition: { duration: 0.55, ease: navEase } };

  const mobileMenuLayer = (
    <AnimatePresence>
      {mobileOpen ? (
        <>
          <motion.button
            key="mobile-menu-backdrop"
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[100] bg-[color-mix(in_srgb,var(--nestora-forest)_16%,transparent)] backdrop-blur-[3px] md:hidden"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22, ease: navEase }}
            onClick={closeMobile}
          />
          <motion.div
            key="mobile-menu-shell"
            className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center p-3 sm:p-4 md:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22, ease: navEase }}
          >
            <motion.div
              id={mobileMenuId}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className={cn(
                'marketing-nav-mobile-sheet pointer-events-auto flex w-full max-w-sm max-h-[min(85dvh,34rem)] flex-col overflow-hidden',
                'rounded-2xl border border-border/80 shadow-nestora-lg ring-1 ring-foreground/[0.05]',
              )}
              variants={mobileMenuPanel}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              exit={reduceMotion ? undefined : 'exit'}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 flex-col gap-0.5 border-b border-border/70 px-4 py-3.5 sm:px-5">
                <p className="text-label font-bold uppercase tracking-[0.14em] text-[var(--nestora-nav-muted)]">
                  Explore
                </p>
                <p className="text-h3 font-semibold tracking-tight text-foreground">Menu</p>
              </div>
              <nav
                aria-label="Mobile"
                className="min-h-0 flex-1 overflow-y-auto px-2 py-2.5 sm:px-2.5"
              >
                <motion.ul
                  className="flex flex-col gap-0.5"
                  variants={mobileNavList}
                  initial={reduceMotion ? false : 'hidden'}
                  animate="show"
                  exit="hidden"
                >
                  {navItems.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      item={item}
                      active={isNavItemActive(item, pathname, hash)}
                      onNavigate={closeMobile}
                    />
                  ))}
                </motion.ul>
                <motion.div
                  className="mt-2 border-t border-border/70 px-1.5 pt-3"
                  variants={mobileNavFooter}
                  initial={reduceMotion ? false : 'hidden'}
                  animate="show"
                  exit={reduceMotion ? undefined : 'exit'}
                >
                  <MotionLink
                    href="/login"
                    prefetch={false}
                    onClick={closeMobile}
                    className={cn(
                      'marketing-nav-cta relative h-12 min-h-12 w-full overflow-hidden px-6 text-body motion-reduce:transition-none',
                      nestoraPrimaryCtaClasses,
                    )}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    whileHover={reduceMotion ? undefined : { y: -1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                  >
                    <span className="relative z-[1] inline-flex items-center justify-center gap-2">
                      Sign in
                      <ArrowUpRight
                        className="size-4 shrink-0 text-current"
                        aria-hidden
                        strokeWidth={2.25}
                      />
                    </span>
                  </MotionLink>
                </motion.div>
              </nav>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <motion.header
        className={cn(
          'marketing-nav sticky top-0 w-full border-b',
          mobileOpen ? 'z-[120]' : 'z-50',
          'transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none',
          scrolled
            ? 'border-border bg-[color-mix(in_srgb,var(--background)_82%,transparent)] shadow-[0_1px_0_0_color-mix(in_srgb,var(--foreground)_5%,transparent),0_10px_40px_-24px_color-mix(in_srgb,var(--nestora-forest)_22%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--background)_70%,transparent)]'
            : 'border-border/50 bg-[color-mix(in_srgb,var(--background)_58%,transparent)] backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--background)_48%,transparent)]',
        )}
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={headerMotion}
      >
        <div className="relative mx-auto flex h-14 max-w-[var(--container-marketing)] items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.45, ease: navEase, delay: 0.04 },
            }}
          >
            <Link
              href="/"
              className={cn(
                'group flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2.5 rounded-lg sm:gap-3',
                navLinkFocus,
              )}
            >
              <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card shadow-nestora ring-1 ring-foreground/[0.04] transition-[border-color,box-shadow] duration-200 group-hover:border-[color-mix(in_oklch,var(--primary)_25%,var(--border))] group-hover:shadow-nestora-md motion-reduce:group-hover:shadow-nestora">
                <Image
                  src="/images/nestora-mark.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="size-6 object-contain sm:size-7"
                  priority
                  unoptimized
                />
                <Building2
                  className="pointer-events-none absolute -bottom-1 -right-1 size-3 rounded-full bg-background p-px text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:group-hover:opacity-0"
                  aria-hidden
                  strokeWidth={2.25}
                />
              </span>
              <span className="min-w-0 truncate text-h3 font-semibold tracking-tight text-foreground">
                {NESTORA_BRAND_NAME}
              </span>
            </Link>
          </motion.div>

          <nav
            aria-label="Main"
            className="absolute left-1/2 hidden min-w-0 -translate-x-1/2 md:block"
          >
            <motion.ul
              className="flex items-center gap-1 lg:gap-1.5"
              variants={desktopNavList}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
            >
              {navItems.map((item) => (
                <DesktopNavLink
                  key={item.href}
                  item={item}
                  active={isNavItemActive(item, pathname, hash)}
                />
              ))}
            </motion.ul>
          </nav>

          <motion.div
            className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.45, ease: navEase, delay: 0.1 },
            }}
          >
            <MotionLink
              href="/login"
              prefetch={false}
              className={cn(
                'hidden h-10 min-h-10 px-5 text-body sm:inline-flex motion-reduce:transition-none',
                nestoraPrimaryCtaClasses,
              )}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 520, damping: 28 }}
            >
              Sign in
              <ArrowUpRight
                className="size-4 shrink-0 text-current"
                aria-hidden
                strokeWidth={2.25}
              />
            </MotionLink>

            <MobileMenuToggle
              open={mobileOpen}
              menuId={mobileMenuId}
              onToggle={() => setMobileOpen((isOpen) => !isOpen)}
            />
          </motion.div>
        </div>
      </motion.header>
      {portalReady ? createPortal(mobileMenuLayer, document.body) : null}
    </>
  );
}
