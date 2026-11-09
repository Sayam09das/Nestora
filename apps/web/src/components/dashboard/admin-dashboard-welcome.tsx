'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CircleDollarSign, LayoutGrid, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import { AdminDashboardContextCard } from '@/components/dashboard/admin-dashboard-context-card';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

const insightPills = [
  {
    label: '80.6% occupancy',
    href: '/admin/rooms',
    icon: LayoutGrid,
  },
  {
    label: '12 pending',
    href: '/admin/students/requests',
    icon: ShieldCheck,
  },
  {
    label: '₹4.85L collected',
    href: '/admin/fees',
    icon: CircleDollarSign,
  },
] as const;

export function AdminDashboardWelcome() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const greeting = useMemo(() => getGreeting(), []);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelector('[data-welcome-rail]'), {
        scaleY: 0,
        duration: 0.55,
        ease: 'power2.out',
        transformOrigin: 'top center',
        clearProps: 'transform',
      });
      gsap.from(sectionRef.current.querySelectorAll('[data-welcome-pill]'), {
        opacity: 0,
        y: 10,
        duration: 0.35,
        stagger: 0.06,
        delay: 0.12,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="admin-welcome-heading"
      className="relative pt-1"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="relative min-w-0 flex-1 pl-4 sm:pl-5">
          <span
            data-welcome-rail
            className="absolute bottom-1 left-0 top-1 w-1 rounded-full bg-[linear-gradient(180deg,var(--nestora-sage)_0%,color-mix(in_oklch,var(--nestora-sage)_40%,var(--nestora-tan))_55%,var(--nestora-gold)_100%)] shadow-[2px_0_12px_-2px_color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]"
            aria-hidden
          />

          <motion.h2
            id="admin-welcome-heading"
            className="text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-3xl sm:leading-tight"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: motionEase }}
          >
            <span className="block text-muted-foreground">{greeting},</span>
            <span className="mt-0.5 block text-[var(--nestora-forest)]">Admin</span>
          </motion.h2>

          <motion.p
            className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.06, ease: motionEase }}
          >
            Here&apos;s what&apos;s happening across your hostel today.
          </motion.p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {insightPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <li key={pill.label} data-welcome-pill>
                  <Link
                    href={pill.href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)] bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:bg-card',
                      focusRing,
                    )}
                  >
                    <Icon className="size-3.5 text-[var(--nestora-forest)]" aria-hidden />
                    {pill.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <motion.aside
          className="w-full shrink-0 lg:w-auto lg:pt-1"
          initial={reduceMotion ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: motionEase }}
        >
          <AdminDashboardContextCard />
        </motion.aside>
      </div>
    </section>
  );
}
