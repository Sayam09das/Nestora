'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { Flip, gsap, SplitText, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { RoleAccessDetailsCard } from '@/components/marketing/landing/role-access-details-card';
import { RoleInterfacePreview } from '@/components/marketing/landing/role-interface-preview';
import {
  featuredRole,
  type RoleShowcase,
  rolesCopy,
  supportingRoles,
} from '@/components/marketing/landing/roles-content';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const revealEase = [0.22, 1, 0.36, 1] as const;
const cardHoverTransition = { duration: 0.22, ease: revealEase } as const;

type RolePanelProps = {
  role: RoleShowcase;
  featured?: boolean;
  className?: string;
  reduceMotion: boolean | null;
};

function RolePanel({ role, featured, className, reduceMotion }: RolePanelProps) {
  const Icon = role.icon;

  return (
    <motion.article
      data-role-panel
      data-role-id={role.id}
      className={cn(
        'relative flex h-auto w-full min-w-0 flex-col rounded-xl border p-6 transition-[border-color,background-color,box-shadow] duration-300 ease-out sm:p-7',
        featured
          ? cn(
              'surface-role-featured shadow-[0_24px_60px_-36px_color-mix(in_oklch,var(--nestora-forest)_55%,transparent)]',
              'hover:border-[color-mix(in_oklch,var(--nestora-forest)_36%,var(--nestora-sage-muted))]',
              'hover:shadow-[0_28px_64px_-34px_color-mix(in_oklch,var(--nestora-forest)_58%,transparent)]',
            )
          : cn(
              'surface-role-support',
              'hover:shadow-[0_22px_48px_-34px_color-mix(in_oklch,var(--nestora-forest)_38%,transparent)]',
            ),
        className,
      )}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={cardHoverTransition}
    >
      <div className="flex min-h-0 flex-col">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'surface-role-icon flex size-11 shrink-0 items-center justify-center rounded-md border',
              !featured && 'surface-role-icon-support',
            )}
          >
            <Icon className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tabular-nums tracking-[0.14em] text-[var(--nestora-tan)]">
              {role.order}
            </p>
            <h3 className="mt-1 text-h4 font-semibold text-[var(--nestora-forest)]">
              {role.title}
            </h3>
            <p className="mt-1.5 text-caption font-medium text-[var(--nestora-sage)]">
              {role.accessLabel}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5 text-supporting text-[var(--nestora-nav-muted)]">
          {role.points.map((point) => (
            <li key={point} className="flex gap-2 text-pretty">
              <span
                className="mt-2 size-1 shrink-0 rounded-full bg-[var(--nestora-sage)]"
                aria-hidden
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div {...(featured ? { 'data-flip-preview': '' } : {})} className="mt-6 shrink-0 rounded-lg">
        <RoleInterfacePreview roleId={role.id} featured={featured} />
      </div>
    </motion.article>
  );
}

export function RolesSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        return;
      }

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          once: true,
        },
      });

      introTl.from('[data-role-intro]', {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
      });

      let split: SplitText | undefined;

      if (headingRef.current) {
        split = SplitText.create(headingRef.current, {
          type: 'words',
          wordsClass: 'role-heading-word',
        });

        gsap.set(split.words, { display: 'inline-block' });

        introTl.from(
          split.words,
          {
            opacity: 0,
            y: 28,
            rotateX: -12,
            duration: 0.65,
            stagger: 0.04,
            ease: 'power3.out',
            transformOrigin: '50% 100%',
          },
          0.05,
        );
      }

      gsap.from('[data-role-panel]', {
        opacity: 0,
        y: 32,
        duration: 0.62,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '[data-role-stage]',
          start: 'top 85%',
          once: true,
        },
        onComplete: () => {
          gsap.set('[data-role-panel]', { clearProps: 'transform,opacity' });
        },
      });

      gsap.from('[data-role-details]', {
        opacity: 0,
        y: 24,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '[data-role-details]',
          start: 'top 88%',
          once: true,
        },
      });

      const featured = sectionRef.current.querySelector<HTMLElement>(
        '[data-role-id="administrator"]',
      );
      const onFeaturedEnter = () => {
        const preview = featured?.querySelector('[data-flip-preview]');
        if (!preview) {
          return;
        }
        const state = Flip.getState(preview);
        preview.classList.add('role-preview--emphasis');
        Flip.from(state, { duration: 0.38, ease: 'power2.out', scale: true, absolute: false });
      };
      const onFeaturedLeave = () => {
        const preview = featured?.querySelector('[data-flip-preview]');
        if (!preview) {
          return;
        }
        const state = Flip.getState(preview);
        preview.classList.remove('role-preview--emphasis');
        Flip.from(state, { duration: 0.32, ease: 'power2.out', scale: true, absolute: false });
      };

      featured?.addEventListener('mouseenter', onFeaturedEnter);
      featured?.addEventListener('mouseleave', onFeaturedLeave);

      return () => {
        featured?.removeEventListener('mouseenter', onFeaturedEnter);
        featured?.removeEventListener('mouseleave', onFeaturedLeave);
        split?.revert();
      };
    },
    { scope: sectionRef },
  );

  if (!featuredRole) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="roles"
      className="section-roles-band scroll-mt-24 border-t"
      aria-labelledby="roles-heading"
    >
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p
            data-role-intro
            className="text-label font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)]"
          >
            {rolesCopy.eyebrow}
          </p>
          <h2
            id="roles-heading"
            ref={headingRef}
            data-role-intro
            className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)] [perspective:800px]"
          >
            {rolesCopy.title}
          </h2>
          <p
            data-role-intro
            className="mt-4 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]"
          >
            {rolesCopy.description}
          </p>
        </div>

        <div
          data-role-stage
          className={cn(
            'mt-12 grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14',
            'lg:grid-cols-12 lg:items-stretch lg:gap-x-8',
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-col gap-6 sm:col-span-2 lg:col-span-7 lg:h-full">
            <RolePanel role={featuredRole} featured reduceMotion={reduceMotion} />
            <RoleAccessDetailsCard className="min-h-0 flex-1" />
          </div>

          <div className="grid min-h-0 min-w-0 grid-cols-1 gap-6 sm:col-span-2 sm:grid-cols-2 lg:col-span-5 lg:flex lg:h-full lg:flex-col">
            {supportingRoles.map((role) => (
              <RolePanel
                key={role.id}
                role={role}
                reduceMotion={reduceMotion}
                className={cn(role.id === 'accountant' && 'sm:col-span-2 lg:col-span-1')}
              />
            ))}
          </div>
        </div>

        <p
          data-role-intro
          className="mx-auto mt-8 max-w-xl text-center text-caption text-[var(--nestora-nav-muted)] lg:mt-10"
        >
          {rolesCopy.footnote}
        </p>
      </div>
    </section>
  );
}
