'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, ClipboardCheck, ClipboardList, Megaphone, UserPlus, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const actions = [
  {
    id: 'visitor',
    label: 'Register Visitor',
    hint: 'Record a new visitor',
    href: '/warden/visitors',
    icon: UserPlus,
  },
  {
    id: 'attendance',
    label: 'Mark Attendance',
    hint: 'Update student attendance',
    href: '/warden/attendance',
    icon: ClipboardCheck,
  },
  {
    id: 'maintenance',
    label: 'Report Maintenance',
    hint: 'Create a repair request',
    href: '/warden/maintenance',
    icon: Wrench,
  },
  {
    id: 'announcement',
    label: 'Post Announcement',
    hint: 'Notify hostel students',
    href: '/warden/announcements',
    icon: Megaphone,
  },
  {
    id: 'register',
    label: 'Daily register',
    hint: "Today's hostel activity log",
    href: '/warden/register',
    icon: ClipboardList,
  },
  {
    id: 'reports',
    label: 'Reports',
    hint: 'Analytics and exports',
    href: '/warden/reports',
    icon: BarChart3,
  },
] as const;

export function WardenDashboardQuickActionsBar() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-warden-quick]'), {
        opacity: 0,
        y: 8,
        duration: 0.32,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Quick actions"
      className="rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] p-4"
    >
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
        Quick actions
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <li key={action.id} data-warden-quick>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.28, ease: motionEase }}
              >
                <Link
                  href={action.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 shadow-sm',
                    'transition-[border-color,box-shadow] hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:shadow-md',
                    focusRing,
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--nestora-forest)_8%,var(--muted))] text-[var(--nestora-forest)] transition-colors group-hover:bg-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--muted))]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{action.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{action.hint}</span>
                  </span>
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
