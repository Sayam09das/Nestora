'use client';

import './home-hero.css';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BedDouble,
  CreditCard,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const previewStats = [
  { label: 'Total students', value: '248', hint: 'Demo data' },
  { label: 'Occupied rooms', value: '186 / 220', hint: 'Demo data' },
  { label: 'Pending fees', value: '₹42,800', hint: 'Demo data' },
] as const;

const previewActivity = [
  { time: '09:14', text: 'Room B12 checkout approved' },
  { time: '08:40', text: 'Attendance marked for Block A' },
  { time: 'Yesterday', text: 'Maintenance ticket #184 closed' },
] as const;

const previewOccupancy = [
  { room: 'A-04', pct: 100 },
  { room: 'A-11', pct: 82 },
  { room: 'B-03', pct: 64 },
  { room: 'B-12', pct: 41 },
  { room: 'C-07', pct: 26 },
] as const;

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
      className="dark nestora-hero border-b border-border bg-background text-foreground"
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
            <p className="sr-only">
              Demonstration only: sample dashboard interface. Figures are not live data.
            </p>
            <div
              className="nestora-hero-preview relative overflow-hidden rounded-none border border-border bg-card ring-1 ring-foreground/[0.08] shadow-nestora-lg"
              role="img"
              aria-label="Demonstration preview of the Nestora hostel administration dashboard"
            >
              <div className="flex min-h-[min(28rem,70vh)] min-w-0 flex-col sm:min-h-[26rem] lg:min-h-[min(32rem,72vh)]">
                <div className="flex min-h-0 min-w-0 flex-1">
                  <aside className="flex w-[3.25rem] shrink-0 flex-col items-center gap-3 border-r border-border bg-[color-mix(in_oklch,var(--card),var(--background)_22%)] py-4">
                    <div className="flex size-8 items-center justify-center rounded-md border border-border bg-background">
                      <Image
                        src="/images/image.png"
                        alt=""
                        width={22}
                        height={22}
                        className="size-[1.375rem] object-contain"
                      />
                    </div>
                    <nav aria-label="Preview sidebar" className="flex flex-col items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/25">
                        <LayoutDashboard className="size-4" aria-hidden />
                      </span>
                      <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground">
                        <Users className="size-4" aria-hidden />
                      </span>
                      <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground">
                        <BedDouble className="size-4" aria-hidden />
                      </span>
                      <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground">
                        <CreditCard className="size-4" aria-hidden />
                      </span>
                      <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground">
                        <Settings className="size-4" aria-hidden />
                      </span>
                    </nav>
                    <div className="mt-auto flex flex-col items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                        <UserRound className="size-4" aria-hidden />
                      </span>
                    </div>
                  </aside>

                  <div className="min-w-0 flex-1 overflow-x-clip bg-background p-4 sm:p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                      <div className="min-w-0">
                        <p className="text-label font-medium text-muted-foreground">Dashboard</p>
                        <p className="mt-1 min-w-0 break-words text-h4 font-semibold text-foreground">
                          Sunrise Hall: overview
                        </p>
                        <p className="mt-1 text-caption text-muted-foreground">
                          Sample data for demonstration purposes
                        </p>
                      </div>
                      <span className="rounded-none border border-border bg-muted px-2.5 py-1 text-caption text-muted-foreground">
                        Academic year 2025 to 2026
                      </span>
                    </div>

                    <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
                      {previewStats.map((stat) => (
                        <Card
                          key={stat.label}
                          size="sm"
                          className="rounded-none border border-border bg-card shadow-none ring-0"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-label font-medium text-muted-foreground">
                              {stat.label}
                            </CardTitle>
                            <CardDescription className="sr-only">{stat.hint}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-stat text-foreground tabular-nums">{stat.value}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                      <Card
                        size="sm"
                        className="rounded-none border border-border bg-card shadow-none ring-0"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-label font-medium text-foreground">
                            Recent hostel activity
                          </CardTitle>
                          <CardDescription>Illustrative timeline</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          {previewActivity.map((row) => (
                            <div
                              key={row.text}
                              className="flex gap-3 border-b border-border/80 pb-3 last:border-b-0 last:pb-0"
                            >
                              <span className="w-16 shrink-0 text-caption text-muted-foreground tabular-nums">
                                {row.time}
                              </span>
                              <span className="min-w-0 flex-1 break-words text-body text-foreground">
                                {row.text}
                              </span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card
                        size="sm"
                        className="rounded-none border border-border bg-card shadow-none ring-0"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-label font-medium text-foreground">
                            Room occupancy
                          </CardTitle>
                          <CardDescription>By room, demo mix</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          {previewOccupancy.map((row) => (
                            <div key={row.room} className="space-y-1.5">
                              <div className="flex items-center justify-between gap-3 text-caption text-muted-foreground">
                                <span className="tabular-nums">{row.room}</span>
                                <span className="tabular-nums text-foreground">{row.pct}%</span>
                              </div>
                              <div
                                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                                aria-hidden
                              >
                                <div
                                  className="h-full origin-left rounded-full bg-primary"
                                  style={{ transform: `scaleX(${row.pct / 100})` }}
                                />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
