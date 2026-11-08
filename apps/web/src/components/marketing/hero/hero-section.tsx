'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Play, Star } from 'lucide-react';
import { useRef } from 'react';

import { HeroDashboardImage } from '@/components/marketing/hero/hero-dashboard-image';
import { gsap, SplitText, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

function clearHeroMotion(
  targets: Array<Element | null | undefined>,
) {
  gsap.set(targets.filter(Boolean), { clearProps: 'opacity,transform,visibility' });
}

export function HeroSection() {
  const reduceMotion = useReducedMotion();
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

      let headlineSplit: SplitText | undefined;
      let auraTween: gsap.core.Tween | undefined;
      let safetyId = 0;

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
        if (headlineSplit?.chars?.length) {
          gsap.set(headlineSplit.chars, { clearProps: 'opacity,transform' });
        }
      };

      let started = false;

      const runEntrance = () => {
        if (started || !badgeRef.current) {
          return;
        }
        started = true;

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          onComplete: revealAll,
          onInterrupt: revealAll,
        });

        tl.from(badgeRef.current, { opacity: 0, y: -14, duration: 0.45 })
          .from(headlineLine1Ref.current, { opacity: 0, y: 22, duration: 0.55 }, '-=0.15');

        if (headlineLine2Ref.current) {
          try {
            headlineSplit = SplitText.create(headlineLine2Ref.current, {
              type: 'chars',
              aria: 'auto',
            });
            gsap.set(headlineLine2Ref.current, { opacity: 1 });
            tl.from(
              headlineSplit.chars,
              {
                opacity: 0,
                y: 18,
                stagger: 0.022,
                duration: 0.4,
              },
              '-=0.28',
            );
          } catch {
            tl.from(
              headlineLine2Ref.current,
              { opacity: 0, y: 18, duration: 0.45 },
              '-=0.28',
            );
          }
        }

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
            opacity: 0.55,
            duration: 4.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
        }

        safetyId = window.setTimeout(revealAll, 2500);
      };

      runEntrance();
      const retryId = window.requestAnimationFrame(runEntrance);

      return () => {
        window.cancelAnimationFrame(retryId);
        window.clearTimeout(safetyId);
        auraTween?.kill();
        headlineSplit?.revert();
        revealAll();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative scroll-mt-24 overflow-x-clip bg-background pt-10 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-28"
      aria-labelledby="nestora-hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none" aria-hidden>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in srgb, var(--nestora-forest) 4%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--nestora-forest) 4%, transparent) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div
          ref={auraRef}
          className="absolute left-1/2 top-0 h-[480px] w-full max-w-5xl -translate-x-1/2 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 0%, color-mix(in srgb, var(--nestora-sage) 20%, transparent), color-mix(in srgb, var(--nestora-tan) 10%, transparent), transparent 70%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[var(--container-marketing)] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center text-center">
          <div ref={badgeRef}>
            <Link
              href="/#features"
              className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-caption font-medium text-muted-foreground shadow-nestora transition-colors hover:text-foreground"
            >
              Hostel management for universities
            </Link>
          </div>

          <h1
            id="nestora-hero-heading"
            className="mt-6 w-full text-pretty font-sans text-4xl font-extrabold leading-[1.14] tracking-[-0.03em] text-[var(--nestora-forest)] sm:text-5xl sm:leading-[1.12] md:text-6xl lg:text-[3.5rem] lg:leading-[1.1]"
          >
            <span ref={headlineLine1Ref} className="block">
              The platform for
            </span>
            <span
              ref={headlineLine2Ref}
              className="mt-1 block pb-0.5 text-[var(--nestora-gold)] sm:mt-1.5"
            >
              modern campus living.
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 w-full max-w-2xl text-pretty text-body leading-relaxed text-muted-foreground sm:text-lg"
          >
            Automate bed allocations, verify gate passes, streamline fee settlements, and track
            hostel compliance — from one workspace built for university housing teams.
          </p>

          <motion.div
            ref={ctaRef}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row"
            initial={false}
          >
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2, ease: motionEase }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                prefetch={false}
                className={cn(
                  'inline-flex h-12 min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full',
                  'bg-[var(--nestora-forest)] px-8 text-label font-semibold text-white shadow-lg shadow-[color-mix(in_oklch,var(--nestora-forest)_20%,transparent)]',
                  'transition-[background-color,box-shadow] duration-200 hover:bg-[var(--nestora-forest-light)]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nestora-tan)]',
                )}
              >
                Start Free Campus Trial
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </motion.div>

            <motion.div
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2, ease: motionEase }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/#how-it-works"
                className={cn(
                  'inline-flex h-12 min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full',
                  'border border-border bg-card/80 px-6 backdrop-blur-sm',
                  'text-label font-semibold text-[var(--nestora-forest)] shadow-sm',
                  'transition-[background-color,border-color] duration-200 hover:border-[var(--nestora-forest)] hover:bg-card',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nestora-tan)]',
                )}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_25%,transparent)] text-[var(--nestora-forest)]">
                  <Play className="ml-0.5 size-2.5 fill-current" aria-hidden />
                </span>
                Watch Interactive Demo
              </Link>
            </motion.div>
          </motion.div>

          <div
            ref={proofRef}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-caption text-muted-foreground"
          >
            <div className="flex -space-x-2 overflow-hidden" aria-hidden>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                AK
              </span>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-tan)] text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                SR
              </span>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-forest-light)] text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                MD
              </span>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--nestora-sage)] text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                NP
              </span>
            </div>

            <div className="flex items-center gap-1 text-[var(--nestora-gold)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 fill-current" aria-hidden />
              ))}
            </div>

            <span className="font-semibold text-foreground">
              4.9/5 from 180+ university residences · 85,000+ student beds
            </span>
          </div>
        </div>

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
    </section>
  );
}

export function HomeHero() {
  return <HeroSection />;
}

export default HomeHero;
