'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useRef } from 'react';

import { AuthSkiperLink } from '@/components/auth/auth-skiper-link';
import { NestoraBrandImage } from '@/components/brand/nestora-brand-image';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

export const passwordResetSteps = ['Request', 'Verify', 'New password'] as const;

type AuthFlowShellProps = {
  title: string;
  description: string;
  stepIndex?: number;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function AuthStepIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <ol
      className="mb-6 flex items-center justify-center gap-2 sm:gap-3"
      aria-label="Password reset progress"
    >
      {passwordResetSteps.map((label, index) => {
        const active = index === activeIndex;
        const done = index < activeIndex;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-caption font-semibold',
                done && 'bg-[var(--nestora-forest)] text-white',
                active &&
                  !done &&
                  'bg-[color-mix(in_srgb,var(--nestora-sage)_22%,var(--card))] text-[var(--nestora-forest)] ring-2 ring-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]',
                !active && !done && 'bg-muted text-muted-foreground',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                'hidden text-caption font-medium sm:inline',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
            {index < passwordResetSteps.length - 1 ? (
              <span className="mx-1 hidden h-px w-6 bg-border sm:block" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function AuthFlowShell({
  title,
  description,
  stepIndex,
  backHref = '/login',
  backLabel = 'Back to sign in',
  children,
}: AuthFlowShellProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !cardRef.current) {
        return;
      }
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 22,
        scale: 0.98,
        duration: 0.55,
        ease: 'power2.out',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-x-clip bg-background"
      aria-labelledby="auth-flow-title"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 hero-grid-pattern opacity-35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[min(480px,50vh)] w-full max-w-4xl -translate-x-1/2 opacity-65 blur-3xl hero-aura-ambient"
        aria-hidden
      />

      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10 sm:px-6">
        <AuthSkiperLink
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-caption font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          {backLabel}
        </AuthSkiperLink>

        <Link
          href="/"
          className="mb-6 inline-flex self-center rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)] sm:self-start"
        >
          <NestoraBrandImage variant="wordmark" priority />
        </Link>

        {typeof stepIndex === 'number' ? <AuthStepIndicator activeIndex={stepIndex} /> : null}

        <motion.div
          ref={cardRef}
          className="hero-glass-card rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] p-6 shadow-xl sm:p-8"
        >
          <h1
            id="auth-flow-title"
            className="text-h3 font-semibold tracking-tight text-[var(--nestora-forest)]"
          >
            {title}
          </h1>
          <p className="mt-2 text-pretty text-caption leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-6">{children}</div>
        </motion.div>

        <p className="mt-6 flex items-center justify-center gap-2 text-caption text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
          <span>Encrypted reset · Audit logged · Single-use tokens</span>
        </p>
      </div>
    </section>
  );
}
