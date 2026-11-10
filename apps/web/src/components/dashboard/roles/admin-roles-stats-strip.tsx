'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, KeyRound, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { ROLES_STATS, SAMPLE_ROLES } from '@/components/dashboard/roles/admin-roles-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

const motionEase = [0.22, 1, 0.36, 1] as const;

export function AdminRolesStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const totalUsers = SAMPLE_ROLES.reduce((n, r) => n + r.activeUsers, 0);

  const cards = useMemo(
    () => [
      { key: 'roles', label: 'Core roles', value: ROLES_STATS.roles, hint: 'FR-002 landing', icon: ShieldCheck, accent: 'var(--nestora-forest)' },
      { key: 'users', label: 'Active accounts', value: totalUsers.toLocaleString('en-IN'), hint: 'All roles', icon: Users, accent: 'var(--nestora-sage)' },
      { key: 'scope', label: 'Hostel scopes', value: ROLES_STATS.hostelsScoped, hint: 'FR-139 filter', icon: Building2, accent: '#0284c7' },
      { key: 'grants', label: 'Custom grants', value: ROLES_STATS.customGrants, hint: 'Exceptions log', icon: KeyRound, accent: 'var(--nestora-gold)' },
      { key: 'rev', label: 'Pending reviews', value: ROLES_STATS.pendingReviews, hint: 'FR-140 audit', icon: UserCheck, accent: '#7c3aed' },
    ],
    [totalUsers],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-role-stat]'), {
        opacity: 0,
        y: 14,
        duration: 0.4,
        stagger: { each: 0.06, grid: 'auto' },
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="role-stats-heading" className="space-y-3">
      <h2 id="role-stats-heading" className="sr-only">
        Role statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-role-stat>
              <motion.article
                whileHover={reduceMotion ? undefined : { y: -3 }}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: motionEase }}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
                  <Icon className="size-4" style={{ color: card.accent }} aria-hidden />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
              </motion.article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
