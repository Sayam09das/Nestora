'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  FileKey2,
  LayoutDashboard,
  Lock,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { AuthFieldInput } from '@/components/auth/auth-form-fields';
import { AuthSkiperLink } from '@/components/auth/auth-skiper-link';
import { nestoraAdminCtaClasses } from '@/components/marketing/cta-styles';
import { gsap, SplitText, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { getApiBaseUrl } from '@/lib/api/client';
import { loginWithPassword, postLoginRedirect } from '@/lib/api/auth';
import { cn } from '@/lib/utils';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

const motionEase = [0.22, 1, 0.36, 1] as const;

const ADMIN_CONSOLE_ROLES = new Set(['UNIVERSITY_ADMINISTRATOR']);

const adminCapabilities = [
  {
    icon: LayoutDashboard,
    title: 'Occupancy matrix',
    detail: 'Campus-wide bed state',
  },
  {
    icon: Users,
    title: 'Role provisioning',
    detail: 'Wardens, staff, students',
  },
  {
    icon: FileKey2,
    title: 'Audit trail',
    detail: 'Every privileged action',
  },
] as const;

const formField = {
  hidden: { opacity: 0, y: 10 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.07 * index, duration: 0.4, ease: motionEase },
  }),
};

export function AdminLoginScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const shieldPathRef = useRef<SVGPathElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      if (shieldPathRef.current) {
        tl.from(shieldPathRef.current, { drawSVG: 0, duration: 1.1, ease: 'power2.inOut' });
      }

      if (headlineRef.current) {
        const split = SplitText.create(headlineRef.current, {
          type: 'lines',
          linesClass: 'overflow-hidden text-white',
          aria: 'auto',
        });
        tl.from(
          split.lines,
          { yPercent: 110, opacity: 0, duration: 0.55, stagger: 0.08 },
          shieldPathRef.current ? '-=0.55' : 0,
        );
      }

      if (commandRef.current) {
        tl.from(
          commandRef.current.querySelectorAll('[data-admin-command]'),
          { opacity: 0, y: 16, duration: 0.45, stagger: 0.07, clearProps: 'opacity,transform' },
          '-=0.3',
        );
      }
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!getApiBaseUrl()) {
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
        if (!ADMIN_CONSOLE_ROLES.has(result.user.role)) {
          setError(
            'This console is reserved for university administrators. Use institutional sign-in for your role.',
          );
          return;
        }
        setMfaStep(true);
        setError(null);
        return;
      }

      if (!ADMIN_CONSOLE_ROLES.has(result.user.role)) {
        setError(
          'This console is reserved for university administrators. Staff and students should use the main sign-in page.',
        );
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
      className="relative min-h-screen overflow-x-clip bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--background))]"
      aria-labelledby="admin-login-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 hero-grid-pattern opacity-30"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-24 top-1/4 -z-10 size-72 rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_35%,transparent)] opacity-40 blur-3xl"
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0.25 }}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.25, 0.45, 0.25],
                scale: [1, 1.06, 1],
                transition: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
              }
        }
      />

      <div className="flex min-h-screen w-full flex-col md:flex-row">
        {/* Command panel — full-height rail (edge-to-edge on laptop) */}
        <div
          ref={commandRef}
          className={cn(
            'relative isolate flex w-full shrink-0 flex-col justify-between overflow-hidden px-5 py-10 text-white sm:px-8',
            'bg-[linear-gradient(168deg,var(--nestora-forest)_0%,#0a3428_48%,#051f18_100%)]',
            'md:sticky md:top-0 md:max-h-screen md:min-h-screen md:w-[min(46%,540px)] md:overflow-y-auto md:py-12',
            'lg:w-[min(44%,520px)] lg:px-10 lg:py-12 xl:w-[min(42%,560px)] xl:px-12',
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.14] hero-grid-pattern mix-blend-overlay"
            aria-hidden
          />

          <div className="relative z-10 flex flex-1 flex-col justify-between">
          <div data-admin-command>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
              <Activity className="size-3.5 text-[var(--nestora-gold)]" aria-hidden />
              Admin console
            </span>
          </div>

          <div className="mt-8 md:mt-10">
            <div data-admin-command className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <svg
                viewBox="0 0 48 56"
                className="size-14 shrink-0 text-[var(--nestora-gold)]"
                aria-hidden
              >
                <path
                  ref={shieldPathRef}
                  d="M24 3 L43 11.5 V27.5 C43 39.5 24 53 24 53 C24 53 5 39.5 5 27.5 V11.5 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h1
                  ref={headlineRef}
                  id="admin-login-heading"
                  className="text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-white sm:text-[2rem]"
                >
                  University command center
                </h1>
                <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-white/90">
                  Provision roles, review audit logs, and govern every hostel module from one
                  encrypted workspace.
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-2.5 md:mt-9" data-admin-command>
              {adminCapabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.title}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                      <Icon className="size-4 text-[var(--nestora-gold)]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 text-white">
                      <span className="block text-sm font-semibold text-white">{item.title}</span>
                      <span className="block text-xs text-white/80">{item.detail}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p data-admin-command className="mt-8 hidden text-xs text-white/70 md:block">
            MFA-enforced · Immutable audit logs · Session-bound CSRF
          </p>
          </div>
        </div>

        {/* Form column */}
        <div className="relative z-10 flex min-h-[min(100dvh,960px)] min-w-0 flex-1 flex-col items-center justify-center bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--background))] px-5 py-10 text-foreground sm:px-8 md:min-h-screen md:py-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_50%,color-mix(in_oklch,var(--nestora-sage)_12%,transparent),transparent_55%)]"
            aria-hidden
          />
          <div className="relative flex w-full max-w-[26rem] flex-col lg:max-w-[27.5rem]">
            <header className="mb-7 flex items-center justify-between gap-4">
              <AuthSkiperLink
                href="/"
                className="text-caption font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Back to home
              </AuthSkiperLink>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)]"
              >
                <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg border border-[var(--nestora-sage-muted)] bg-card shadow-sm">
                  <Image
                    src="/images/nestora-mark.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="size-6 object-contain"
                    unoptimized
                  />
                </span>
                <span className="text-supporting font-bold tracking-tight text-[var(--nestora-forest)]">
                  {NESTORA_BRAND_NAME}
                </span>
              </Link>
            </header>

          <motion.div
            ref={cardRef}
            className={cn(
              'overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))]',
              'bg-card shadow-[0_20px_50px_-28px_color-mix(in_srgb,var(--nestora-forest)_35%,transparent)]',
              'ring-1 ring-[color-mix(in_oklch,var(--nestora-sage)_12%,transparent)]',
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: motionEase, delay: 0.08 }}
          >
            <div className="p-6 sm:p-8">
              <div className="mb-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--nestora-gold)_45%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_16%,var(--card))] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-forest-dark)]">
                  <LayoutDashboard className="size-3 text-[var(--nestora-forest)]" aria-hidden />
                  Administrator
                </span>
                <h2
                  id="admin-login-form-title"
                  className="text-h3 font-semibold tracking-tight text-[var(--nestora-forest)]"
                >
                  Sign in to console
                </h2>
                <p className="text-pretty text-caption leading-relaxed text-muted-foreground">
                  University housing IT and central administrators only. Credentials are
                  institution-provisioned.
                </p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                custom={0}
                variants={formField}
                initial={false}
                animate="show"
              >
                <label
                  htmlFor="admin-login-email"
                  className="block text-caption font-semibold text-foreground"
                >
                  Administrator email
                </label>
                <AuthFieldInput
                  id="admin-login-email"
                  name="email"
                  autoComplete="username"
                  textType="email"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={setEmail}
                  leadingIcon={Mail}
                />
              </motion.div>

              <motion.div
                custom={1}
                variants={formField}
                initial={false}
                animate="show"
              >
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="admin-login-password"
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
                  id="admin-login-password"
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
                  initial={false}
                  animate="show"
                >
                  <label
                    htmlFor="admin-login-mfa"
                    className="block text-caption font-semibold text-foreground"
                  >
                    Authentication code
                  </label>
                  <AuthFieldInput
                    id="admin-login-mfa"
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
                initial={false}
                animate="show"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    nestoraAdminCtaClasses,
                    'h-12 w-full justify-center gap-2 px-6 text-supporting shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--nestora-gold)_55%,transparent)]',
                    loading && 'opacity-80',
                  )}
                  whileHover={reduceMotion || loading ? undefined : { y: -1 }}
                  whileTap={reduceMotion || loading ? undefined : { scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                >
                  {loading
                    ? 'Verifying…'
                    : mfaStep
                      ? 'Verify and open console'
                      : 'Sign in to admin console'}
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </motion.button>
              </motion.div>
            </form>

            <div className="mt-7 space-y-4 border-t border-[var(--nestora-sage-muted)] pt-6">
              <p className="text-pretty text-center text-caption text-muted-foreground sm:text-left">
                Warden, student, or staff?{' '}
                <AuthSkiperLink href="/login" className="font-semibold text-[var(--nestora-forest)]">
                  Institutional sign-in
                </AuthSkiperLink>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <ShieldCheck className="size-3 text-[var(--nestora-sage)]" aria-hidden />
                  MFA ready
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Audit logged
                </span>
              </div>
            </div>
            </div>
          </motion.div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground sm:text-left">
            Privileged access · Session-bound · FR-002
          </p>
          </div>
        </div>
      </div>
    </section>
  );
}
