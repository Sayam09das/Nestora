'use client';

import './home-hero.css';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const heroEase = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay = 0) {
  return {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: heroEase, delay },
    },
  };
}

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const instant = reduceMotion ? { opacity: 1, y: 0, scale: 1 } : undefined;
  const previewMotion = reduceMotion
    ? { initial: instant, animate: instant }
    : { initial: { opacity: 0, y: 16, scale: 0.99 }, animate: { opacity: 1, y: 0, scale: 1 } };

  return (
    <section
      className="nestora-hero border-b border-border bg-background text-foreground"
      aria-labelledby="nestora-hero-heading"
    >
      <div
        className="nestora-hero__glow pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[var(--container-marketing)] px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-20 lg:pt-12">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-14">
          <div className="min-w-0">
            <motion.p
              className="text-label font-medium text-muted-foreground"
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
              variants={reduceMotion ? undefined : fadeUp(0)}
            >
              Smarter hostel management
            </motion.p>

            <h1
              id="nestora-hero-heading"
              className="mt-3 min-w-0 break-words text-display text-balance"
            >
              <motion.span
                className="block text-foreground"
                initial={reduceMotion ? false : 'hidden'}
                animate={reduceMotion ? undefined : 'visible'}
                variants={reduceMotion ? undefined : fadeUp(0.06)}
              >
                A Better Way to
              </motion.span>
              <motion.span
                className="mt-1 block text-foreground"
                initial={reduceMotion ? false : 'hidden'}
                animate={reduceMotion ? undefined : 'visible'}
                variants={reduceMotion ? undefined : fadeUp(0.1)}
              >
                <span className="text-primary">Manage</span> University{' '}
                <span className="text-primary">Living</span>.
              </motion.span>
            </h1>

            <motion.p
              className="mt-5 max-w-[42rem] text-body text-muted-foreground"
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
              variants={reduceMotion ? undefined : fadeUp(0.12)}
            >
              Simplify hostel operations with one connected platform. Manage students, rooms,
              attendance, payments and everyday hostel activities with greater clarity and control.
            </motion.p>

            <motion.div
              className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
              variants={reduceMotion ? undefined : fadeUp(0.18)}
            >
              <Button
                variant="default"
                size="default"
                nativeButton={false}
                render={<Link href="/register" prefetch={false} />}
                className="nestora-hero__cta-primary h-10 min-h-10 gap-2 px-4 text-body font-medium transition-[transform,background-color] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_28px_-10px_color-mix(in_oklch,var(--primary)_45%,transparent)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none active:translate-y-px motion-reduce:active:translate-y-0"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Link
                href="/#features"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'default' }),
                  'nestora-hero__cta-secondary inline-flex h-10 min-h-10 items-center justify-center gap-2 border-border bg-transparent px-4 text-body font-medium text-foreground transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px hover:bg-muted motion-reduce:hover:translate-y-0 active:translate-y-px motion-reduce:active:translate-y-0',
                )}
              >
                Explore features
              </Link>
            </motion.div>

            <motion.p
              className="mt-5 text-supporting text-muted-foreground"
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
              variants={reduceMotion ? undefined : fadeUp(0.24)}
            >
              Built for modern university hostel administration.
            </motion.p>
          </div>

          <motion.div
            className="min-w-0"
            {...previewMotion}
            transition={reduceMotion ? undefined : { duration: 0.55, ease: heroEase, delay: 0.08 }}
          >
            <figure className="nestora-hero-preview nestora-hero-preview-frame m-0">
              <p className="mb-3 text-caption text-muted-foreground">
                Demonstration graphic: sample dashboard. Figures are not live data.
              </p>
              <div className="relative w-full overflow-hidden rounded-md border border-border bg-card shadow-nestora-lg ring-1 ring-foreground/[0.06]">
                <Image
                  src="/images/hero-dashboard-preview.svg"
                  alt="Sample Nestora hostel administration dashboard with statistics, recent activity, and room occupancy."
                  width={960}
                  height={560}
                  className="h-auto w-full object-cover object-top"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              </div>
            </figure>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
