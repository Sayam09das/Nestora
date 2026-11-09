'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CheckCircle2,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { nestoraAdminCtaClasses } from '@/components/marketing/cta-styles';
import { HeroDashboardImage } from '@/components/marketing/hero/hero-dashboard-image';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const MotionLink = motion.create(Link);

function clearHeroMotion(targets: Array<Element | null | undefined>) {
  gsap.set(targets.filter(Boolean), { clearProps: 'opacity,transform,visibility' });
}

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        return;
      }

      let auraTween: gsap.core.Tween | undefined;
      let safetyId = 0;
      let retryId = 0;

      const revealAll = () => {
        clearHeroMotion([
          badgeRef.current,
          headlineLine1Ref.current,
          headlineLine2Ref.current,
          subtitleRef.current,
          ctaRef.current,
          proofRef.current,
          dashboardRef.current,
        ]);
        if (headlineLine2Ref.current) {
          gsap.set(headlineLine2Ref.current, { opacity: 1, y: 0, clearProps: 'transform' });
        }
      };

      let started = false;

      const runEntrance = () => {
        if (
          started ||
          !badgeRef.current ||
          !headlineLine1Ref.current ||
          !headlineLine2Ref.current
        ) {
          return;
        }
        started = true;

        gsap.set(headlineLine2Ref.current, { opacity: 1 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          onComplete: revealAll,
          onInterrupt: revealAll,
        });

        tl.from(badgeRef.current, { opacity: 0, y: -14, duration: 0.45 }).from(
          headlineLine1Ref.current,
          { opacity: 0, y: 22, duration: 0.55 },
          '-=0.15',
        );

        tl.from(
          headlineLine2Ref.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.55,
            ease: 'power3.out',
          },
          '-=0.22',
        );

        tl.from(subtitleRef.current, { opacity: 0, y: 16, duration: 0.5 }, '-=0.12')
          .from(ctaRef.current, { opacity: 0, y: 14, duration: 0.45 }, '-=0.2')
          .from(proofRef.current, { opacity: 0, duration: 0.45 }, '-=0.15')
          .from(
            dashboardRef.current,
            {
              opacity: 0,
              y: 36,
              scale: 0.98,
              duration: 0.85,
              ease: 'power3.out',
            },
            '-=0.1',
          );

        if (auraRef.current) {
          auraTween = gsap.to(auraRef.current, {
            opacity: 0.6,
            duration: 4.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
        }

        safetyId = window.setTimeout(revealAll, 2500);
      };

      let attempts = 0;
      const scheduleEntrance = () => {
        runEntrance();
        if (!started && attempts < 30) {
          attempts += 1;
          retryId = window.requestAnimationFrame(scheduleEntrance);
        } else if (!started) {
          revealAll();
        }
      };

      scheduleEntrance();

      return () => {
        window.cancelAnimationFrame(retryId);
        window.clearTimeout(safetyId);
        auraTween?.kill();
        revealAll();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative scroll-mt-24 overflow-x-clip bg-background pt-10 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-32"
      aria-labelledby="nestora-hero-heading"
    >
      {/* 21st.dev Ambient Grid Pattern with Radial Mask */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
        aria-hidden
      >
        <div className="absolute inset-0 opacity-60 hero-grid-pattern" />

        <div
          ref={auraRef}
          className="absolute left-1/2 top-0 h-[520px] w-full max-w-5xl -translate-x-1/2 opacity-85 hero-aura-ambient"
        />
      </div>

      <div className="relative mx-auto max-w-[var(--container-marketing)] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center text-center">
          <div ref={badgeRef} className="flex w-full justify-center">
            <MotionLink
              href="/#features"
              aria-label="Nestora 2.0 — Automated Multi-Campus Allocation Engine"
              className={cn(
                'hero-announcement-badge group relative inline-flex max-w-full items-center gap-2 overflow-hidden',
                'rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_32%,var(--border))]',
                'px-3 py-1.5 text-caption font-medium text-foreground shadow-xs backdrop-blur-md',
                'ring-1 ring-foreground/[0.04]',
                'hover:border-[color-mix(in_oklch,var(--nestora-sage)_55%,var(--border))] hover:shadow-sm',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)]',
                'sm:gap-2.5 sm:px-4',
              )}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 520, damping: 30 }}
            >
              <span className="relative z-[1] inline-flex shrink-0 items-center gap-2">
                <span className="relative flex size-2 shrink-0 items-center justify-center">
                  <span className="absolute inline-flex size-full motion-safe:animate-ping rounded-full bg-[color-mix(in_oklch,var(--primary)_65%,white)] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <span className="whitespace-nowrap font-semibold tracking-tight text-[var(--nestora-forest)]">
                  Nestora 2.0
                </span>
              </span>
              <span
                className="relative z-[1] hidden h-3 w-px shrink-0 bg-border sm:block"
                aria-hidden
              />
              <span
                className={cn(
                  'relative z-[1] hidden min-w-0 text-pretty text-caption leading-snug text-muted-foreground sm:inline',
                  'transition-colors duration-200 group-hover:text-foreground',
                )}
              >
                Automated Multi-Campus Allocation Engine
              </span>
              <span
                className={cn(
                  'relative z-[1] whitespace-nowrap text-caption text-muted-foreground sm:hidden',
                  'transition-colors duration-200 group-hover:text-foreground',
                )}
              >
                <span
                  className="pr-1 text-[color-mix(in_srgb,var(--border)_85%,var(--foreground))]"
                  aria-hidden
                >
                  ·
                </span>
                Multi-campus engine
              </span>
              <ArrowRight
                className="relative z-[1] size-3.5 shrink-0 text-muted-foreground transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--nestora-forest)]"
                aria-hidden
              />
            </MotionLink>
          </div>

          {/* High-Impact SaaS Headline */}
          <h1
            id="nestora-hero-heading"
            className="mt-6 w-full text-pretty font-sans text-4xl font-extrabold tracking-[-0.035em] text-[var(--nestora-forest)] sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.08]"
          >
            <span ref={headlineLine1Ref} className="block font-extrabold tracking-tight">
              The platform for
            </span>
            <span
              ref={headlineLine2Ref}
              className="mt-1 block pb-1 bg-gradient-to-r from-[var(--nestora-tan)] via-[#d99f57] to-[var(--nestora-gold)] bg-clip-text text-transparent sm:mt-2"
            >
              modern campus living.
            </span>
          </h1>

          {/* Supporting Subtitle */}
          <p
            ref={subtitleRef}
            className="mt-6 w-full max-w-2xl text-pretty text-body leading-relaxed text-muted-foreground sm:text-lg"
          >
            Automate bed allocations, verify gate passes, streamline fee settlements, and track
            hostel compliance — from one centralized workspace built for university housing teams.
          </p>

          {/* SaaS Action Center (CTAs) */}
          <motion.div
            ref={ctaRef}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row"
            initial={false}
          >
            {/* Primary CTA */}
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2, ease: motionEase }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/login"
                prefetch={false}
                className={cn(
                  'group relative inline-flex h-12 min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full',
                  'bg-[var(--nestora-forest)] px-8 text-supporting font-semibold text-white',
                  'shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-6px_rgba(12,59,46,0.35)]',
                  'transition-[background-color,box-shadow,transform] duration-200 hover:bg-[var(--nestora-forest-light)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_12px_28px_-6px_rgba(12,59,46,0.45)]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nestora-tan)]',
                )}
              >
                <span>Sign in to Nestora</span>
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </motion.div>

            {/* Secondary CTA — Interactive Demo */}
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2, ease: motionEase }}
              className="w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => setWalkthroughOpen(true)}
                className={cn(
                  'group inline-flex h-12 min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full cursor-pointer',
                  'border border-border/80 bg-card/85 px-6 backdrop-blur-md',
                  'text-supporting font-semibold text-[var(--nestora-forest)] shadow-xs',
                  'transition-all duration-200 hover:border-[var(--nestora-forest)] hover:bg-card hover:shadow-sm',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nestora-tan)]',
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_25%,transparent)] text-[var(--nestora-forest)] transition-transform duration-200 group-hover:scale-110">
                  <Play className="ml-0.5 size-3 fill-current" aria-hidden />
                </span>
                <span>Watch Interactive Demo</span>
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-5 flex w-full flex-col items-center justify-center gap-2 sm:flex-row"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4, ease: motionEase }}
          >
            <span className="text-caption text-muted-foreground">University IT?</span>
            <MotionLink
              href="/admin/login"
              prefetch={false}
              className={cn(
                'h-11 min-h-11 w-full px-7 text-supporting sm:w-auto',
                nestoraAdminCtaClasses,
              )}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 520, damping: 28 }}
            >
              Admin console
              <ArrowRight className="size-4 shrink-0" aria-hidden strokeWidth={2.5} />
            </MotionLink>
          </motion.div>

          {/* Micro-guarantees Row */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-caption text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              No credit card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              Deploy in under 48 hours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-[var(--nestora-tan)]" aria-hidden />
              FERPA & Data Privacy Compliant
            </span>
          </div>

          {/* Social Proof & Authority Strip */}
          <div
            ref={proofRef}
            className="mt-8 flex flex-col items-center justify-center gap-3 text-caption text-muted-foreground"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden" aria-hidden>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[10px] font-bold text-white ring-2 ring-card shadow-xs">
                  AK
                </span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-tan)] text-[10px] font-bold text-white ring-2 ring-card shadow-xs">
                  SR
                </span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-forest-light)] text-[10px] font-bold text-white ring-2 ring-card shadow-xs">
                  MD
                </span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-sage)] text-[10px] font-bold text-white ring-2 ring-card shadow-xs">
                  NP
                </span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-cream)] text-[10px] font-bold text-[var(--nestora-forest)] ring-2 ring-card shadow-xs">
                  +180
                </span>
              </div>

              <div className="flex items-center gap-1 text-[var(--nestora-gold)]" aria-hidden>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={`star-${star}`} className="size-3.5 fill-current" />
                ))}
              </div>

              <span className="font-semibold text-foreground">
                4.9/5 from 180+ university residences · 85,000+ student beds
              </span>
            </div>

            {/* Institutional Trust Pills */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              {[
                'Central Universities',
                'Premier Engineering Campuses',
                'Medical Residences',
                'Multi-Building Trusts',
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/60 bg-card/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 21st.dev Interactive Dashboard Frame */}
        <motion.div
          ref={dashboardRef}
          className="mt-12 sm:mt-16 lg:mt-20"
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -4,
                  transition: { duration: 0.35, ease: motionEase },
                }
          }
        >
          <HeroDashboardImage />
        </motion.div>
      </div>

      {/* Interactive Demo Walkthrough Modal */}
      <Dialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen}>
        <DialogContent className="max-w-3xl sm:max-w-4xl p-6 sm:p-8 rounded-2xl bg-card border-border shadow-2xl">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2 text-label font-bold uppercase tracking-wider text-[var(--nestora-tan)]">
              <Sparkles className="size-4" />
              <span>Interactive Platform Tour</span>
            </div>
            <DialogTitle className="mt-1.5 text-h3 font-semibold text-[var(--nestora-forest)] sm:text-h2">
              Experience the Nestora Workspace
            </DialogTitle>
            <DialogDescription className="mt-2 text-body leading-relaxed text-muted-foreground">
              Discover how university wardens, administrators, and students collaborate seamlessly
              across room allocation, gate passes, and fee reconciliation.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--nestora-forest)] text-white">
                <BedDouble className="size-4" />
              </span>
              <h4 className="mt-3 text-supporting font-semibold text-[var(--nestora-forest)]">
                Bed Allocation Engine
              </h4>
              <p className="mt-1 text-caption text-muted-foreground leading-normal">
                Visual matrix tracking room availability, bed reservations, and transfer histories
                in real time.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/40 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--nestora-sage)] text-white">
                <ShieldCheck className="size-4" />
              </span>
              <h4 className="mt-3 text-supporting font-semibold text-[var(--nestora-forest)]">
                Biometric Gate Pass
              </h4>
              <p className="mt-1 text-caption text-muted-foreground leading-normal">
                Digital gate slips, RFID turnstile logs, parent SMS alerts, and zero unaccounted
                absences.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/40 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--nestora-tan)] text-white">
                <Users className="size-4" />
              </span>
              <h4 className="mt-3 text-supporting font-semibold text-[var(--nestora-forest)]">
                Role-Based Portals
              </h4>
              <p className="mt-1 text-caption text-muted-foreground leading-normal">
                Distinct views for Admins, Wardens, Students, and Accountants with strict access
                controls.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setWalkthroughOpen(false)}
              className="h-11 w-full rounded-full border border-border px-5 text-supporting font-medium text-muted-foreground hover:bg-muted sm:w-auto cursor-pointer"
            >
              Close Preview
            </button>
            <Link
              href="/login"
              onClick={() => setWalkthroughOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--nestora-forest)] px-6 text-supporting font-semibold text-white shadow-md hover:bg-[var(--nestora-forest-light)] sm:w-auto"
            >
              <span>Sign in to Nestora</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setWalkthroughOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-card px-5 text-supporting font-semibold text-[var(--nestora-forest)] shadow-xs hover:border-[var(--nestora-forest)] sm:w-auto"
            >
              <span>Schedule 1-on-1 Walkthrough</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function HomeHero() {
  return <HeroSection />;
}

export default HomeHero;
