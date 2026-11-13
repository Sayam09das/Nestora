'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useRef, useState } from 'react';

import { AuthFieldInput } from '@/components/auth/auth-form-fields';
import { AuthSkiperLink } from '@/components/auth/auth-skiper-link';
import { loginWithPassword, postLoginRedirect } from '@/lib/api/auth';
import { isApiConfigured } from '@/lib/api/client';
import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const trustMetrics = [
  { label: 'Active beds tracked', value: '12,400+' },
  { label: 'Gate passes / day', value: '3.2k' },
  { label: 'Campuses on Nestora', value: '48' },
] as const;

const formField = {
  hidden: { opacity: 0, y: 10 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * index, duration: 0.4, ease: motionEase },
  }),
};

type LoginRole = 'staff' | 'student';

export function LoginScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const roleGroupId = useId();
  const [role, setRole] = useState<LoginRole>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      if (storyRef.current) {
        tl.from(storyRef.current.querySelectorAll('[data-login-reveal]'), {
          opacity: 0,
          y: 20,
          duration: 0.55,
          stagger: 0.08,
        });
      }

      if (cardRef.current) {
        tl.from(
          cardRef.current,
          { opacity: 0, y: 24, scale: 0.98, duration: 0.6 },
          storyRef.current ? '-=0.35' : 0,
        );
      }
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isApiConfigured()) {
      setError('API URL is not configured. Set NEXT_PUBLIC_API_URL in apps/web/.env.local.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(
        email.trim(),
        password,
        mfaStep ? mfaCode : undefined,
      );

      if (result.kind === 'error') {
        setError(result.message);
        if (result.code === 'MUST_CHANGE_PASSWORD') {
          router.push('/change-password');
        }
        return;
      }

      if (result.kind === 'mfa_required') {
        setMfaStep(true);
        setError(null);
        return;
      }

      router.push(postLoginRedirect(result.user));
    } catch {
      setError('Unable to reach the API. Is the backend running on the configured URL?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-x-clip bg-background"
      aria-labelledby="login-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 hero-grid-pattern opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[min(520px,55vh)] w-full max-w-6xl -translate-x-1/2 opacity-70 blur-3xl hero-aura-ambient"
        aria-hidden
      />

      <div className="mx-auto flex min-h-screen max-w-[var(--container-marketing)] flex-col px-4 py-8 sm:px-6 lg:flex-row lg:items-stretch lg:gap-12 lg:px-8 lg:py-0">
        {/* Brand story — Dribbble-style split hero (desktop) */}
        <div
          ref={storyRef}
          className="relative hidden flex-1 flex-col justify-center py-12 lg:flex lg:max-w-md xl:max-w-lg"
        >
          <div data-login-reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-card/90 px-3 py-1 text-caption font-semibold uppercase tracking-[0.12em] text-[var(--nestora-tan)] shadow-xs backdrop-blur-sm">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              Secure sign-in
            </span>
          </div>

          <h1
            id="login-heading"
            data-login-reveal
            className="mt-5 text-balance text-[2.125rem] font-semibold leading-[1.12] tracking-tight text-[var(--nestora-forest)] xl:text-[2.5rem]"
          >
            One workspace for housing teams and students.
          </h1>

          <p
            data-login-reveal
            className="mt-4 max-w-md text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]"
          >
            Role-based portals for wardens, staff, and students — bed matrix, gate passes, and fee
            settlements in a single auditable system.
          </p>

          <ul data-login-reveal className="mt-8 space-y-3">
            {trustMetrics.map((metric) => (
              <li
                key={metric.label}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card/80 px-4 py-3 shadow-xs backdrop-blur-sm"
              >
                <span className="text-caption text-muted-foreground">{metric.label}</span>
                <span className="text-supporting font-semibold tabular-nums text-[var(--nestora-forest)]">
                  {metric.value}
                </span>
              </li>
            ))}
          </ul>

          <motion.div
            data-login-reveal
            className="mt-8 flex flex-wrap gap-3"
            initial={false}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -4, 0],
                    transition: {
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    },
                  }
            }
          >
            <div className="hero-glass-card flex items-center gap-2 rounded-2xl px-4 py-3">
              <BedDouble className="size-4 text-primary" aria-hidden />
              <span className="text-caption font-medium text-foreground">Live bed matrix</span>
            </div>
            <div className="hero-glass-card flex items-center gap-2 rounded-2xl px-4 py-3">
              <Building2 className="size-4 text-[var(--nestora-tan)]" aria-hidden />
              <span className="text-caption font-medium text-foreground">Multi-campus</span>
            </div>
          </motion.div>
        </div>

        {/* Form column */}
        <div className="flex flex-1 flex-col justify-center py-6 lg:max-w-md lg:py-16 xl:ml-auto">
          <div className="mb-6 lg:mb-8">
            <AuthSkiperLink
              href="/"
              className="inline-flex items-center gap-2 text-caption font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Back to home
            </AuthSkiperLink>
          </div>

          <div className="text-center lg:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)]"
            >
              <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-xl border border-[var(--nestora-sage-muted)] bg-card shadow-sm">
                <Image
                  src="/images/nestora-mark.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="size-7 object-contain"
                  unoptimized
                />
              </span>
              <span className="text-h3 font-bold tracking-tight text-[var(--nestora-forest)]">
                {NESTORA_BRAND_NAME}
              </span>
            </Link>

            <p className="mt-4 text-h3 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-h2 lg:hidden">
              Institutional sign in
            </p>
            <p className="mt-1.5 text-caption text-muted-foreground lg:mt-4">
              Access your assigned campus residence modules.
            </p>
          </div>

          <motion.div
            ref={cardRef}
            className={cn(
              'hero-glass-card mt-8 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] p-6 shadow-xl sm:p-8',
            )}
            initial={reduceMotion ? false : { opacity: 1 }}
          >
            <div
              role="tablist"
              aria-label="Sign-in role"
              className="relative mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border/80 bg-muted/40 p-1"
            >
              {(
                [
                  { id: 'staff' as const, label: 'Staff / Warden', icon: UserCog },
                  { id: 'student' as const, label: 'Student', icon: GraduationCap },
                ] as const
              ).map((option) => {
                const active = role === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    id={`${roleGroupId}-${option.id}`}
                    aria-selected={active}
                    aria-controls={`${roleGroupId}-panel`}
                    onClick={() => setRole(option.id)}
                    className={cn(
                      'relative z-[1] flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-caption font-semibold',
                      'transition-[color] duration-200',
                      active ? 'text-white' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {active && !reduceMotion ? (
                      <motion.span
                        layoutId="login-role-surface"
                        className="absolute inset-0 rounded-lg bg-[var(--nestora-forest)] shadow-xs"
                        transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                        aria-hidden
                      />
                    ) : active ? (
                      <span
                        className="absolute inset-0 rounded-lg bg-[var(--nestora-forest)] shadow-xs"
                        aria-hidden
                      />
                    ) : null}
                    <Icon className="relative z-[1] size-4 shrink-0" aria-hidden />
                    <span className="relative z-[1]">{option.label}</span>
                  </button>
                );
              })}
            </div>

            <form
              id={`${roleGroupId}-panel`}
              role="tabpanel"
              aria-labelledby={`${roleGroupId}-${role}`}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <motion.div
                custom={0}
                variants={formField}
                initial={reduceMotion ? false : 'hidden'}
                animate="show"
              >
                <label
                  htmlFor="login-email"
                  className="block text-caption font-semibold text-foreground"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={role}
                      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: motionEase }}
                      className="inline-block"
                    >
                      {role === 'staff' ? 'Institutional email' : 'Student email or enrollment ID'}
                    </motion.span>
                  </AnimatePresence>
                </label>
                <AuthFieldInput
                  id="login-email"
                  name="email"
                  autoComplete="username"
                  textType={role === 'staff' ? 'email' : 'text'}
                  placeholder={
                    role === 'staff' ? 'warden@university.edu' : 'student2025@university.edu'
                  }
                  value={email}
                  onChange={setEmail}
                  leadingIcon={Mail}
                />
              </motion.div>

              <motion.div
                custom={1}
                variants={formField}
                initial={reduceMotion ? false : 'hidden'}
                animate="show"
              >
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="login-password"
                    className="block text-caption font-semibold text-foreground"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-caption font-medium text-[var(--nestora-sage)] underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <AuthFieldInput
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={setPassword}
                  leadingIcon={Lock}
                  revealable
                  visible={passwordVisible}
                  onToggleVisible={() => setPasswordVisible((current) => !current)}
                  labelShow="Show password"
                  labelHide="Hide password"
                />
              </motion.div>

              {mfaStep ? (
                <motion.div
                  custom={2}
                  variants={formField}
                  initial={reduceMotion ? false : 'hidden'}
                  animate="show"
                >
                  <label
                    htmlFor="login-mfa"
                    className="block text-caption font-semibold text-foreground"
                  >
                    Authentication code
                  </label>
                  <AuthFieldInput
                    id="login-mfa"
                    name="mfaCode"
                    autoComplete="one-time-code"
                    textType="text"
                    placeholder="123456"
                    value={mfaCode}
                    onChange={setMfaCode}
                    leadingIcon={ShieldCheck}
                  />
                </motion.div>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive"
                >
                  {error}
                </p>
              ) : null}

              <motion.div
                custom={mfaStep ? 3 : 2}
                variants={formField}
                initial={reduceMotion ? false : 'hidden'}
                animate="show"
                className="flex items-center py-1"
              >
                <label className="flex cursor-pointer items-center gap-2 text-caption text-muted-foreground">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-4 rounded border-border text-[var(--nestora-forest)] focus:ring-[var(--nestora-sage)]"
                  />
                  Remember this device
                </label>
              </motion.div>

              <motion.div
                custom={mfaStep ? 4 : 3}
                variants={formField}
                initial={reduceMotion ? false : 'hidden'}
                animate="show"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    nestoraPrimaryCtaClasses,
                    'h-12 w-full justify-center gap-2 px-6 text-supporting shadow-md',
                    loading && 'opacity-80',
                  )}
                  whileHover={reduceMotion || loading ? undefined : { y: -1 }}
                  whileTap={reduceMotion || loading ? undefined : { scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                >
                  {loading
                    ? 'Signing in…'
                    : mfaStep
                      ? 'Verify and sign in'
                      : `Sign in to ${role === 'staff' ? 'staff portal' : 'student portal'}`}
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </motion.button>
              </motion.div>
            </form>

            <div className="mt-6 border-t border-[var(--nestora-sage-muted)] pt-5 text-center lg:text-left">
              <p className="text-pretty text-caption text-muted-foreground">
                University administrator?{' '}
                <AuthSkiperLink
                  href="/admin/login"
                  className="font-semibold text-[var(--nestora-forest)]"
                >
                  Admin console sign-in
                </AuthSkiperLink>
              </p>
              <p className="mt-3 text-pretty text-caption text-muted-foreground">
                Accounts are created by your institution&apos;s admin.{' '}
                <AuthSkiperLink
                  href="/contact"
                  className="font-semibold text-[var(--nestora-forest)]"
                >
                  Contact your housing office
                </AuthSkiperLink>
              </p>
            </div>
          </motion.div>

          <p className="mt-6 flex items-center justify-center gap-2 text-caption text-muted-foreground lg:justify-start">
            <ShieldCheck className="size-4 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
            <span>RBAC · TLS 1.3 · Session audit logs</span>
          </p>
        </div>
      </div>
    </section>
  );
}
