'use client';

import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [role, setRole] = useState<'staff' | 'student'>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo feedback for authentication
    alert(`Authentication demo: Sign-in verified for ${email}`);
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-x-clip bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* 21st.dev Ambient Aurora Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[480px] w-full max-w-4xl -translate-x-1/2 opacity-60 blur-3xl hero-aura-ambient"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-caption font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Nestora Home</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
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
          <h1 className="mt-4 text-h3 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-h2">
            Institutional Sign In
          </h1>
          <p className="mt-1.5 text-caption text-muted-foreground">
            Sign in to access your assigned campus residence modules.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card p-6 shadow-xl sm:p-8">
          {/* Role Toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl border border-border/80 bg-muted/50 p-1 text-caption">
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={cn(
                'rounded-lg py-2 font-semibold transition-all cursor-pointer',
                role === 'staff'
                  ? 'bg-[var(--nestora-forest)] text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Warden / Staff / Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('student')}
              className={cn(
                'rounded-lg py-2 font-semibold transition-all cursor-pointer',
                role === 'student'
                  ? 'bg-[var(--nestora-forest)] text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Student Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-caption font-semibold text-foreground"
              >
                {role === 'staff' ? 'Institutional Email' : 'Student Email / Enrollment ID'}
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  id="login-email"
                  required
                  placeholder={
                    role === 'staff' ? 'warden@university.edu' : 'student2025@university.edu'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-caption font-semibold text-foreground"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to institutional admin.')}
                  className="text-caption font-medium text-[var(--nestora-sage)] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  type="password"
                  id="login-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-caption text-muted-foreground">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-border text-[var(--nestora-forest)] focus:ring-[var(--nestora-sage)]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              className={cn(
                nestoraPrimaryCtaClasses,
                'h-11 w-full justify-center px-6 text-supporting shadow-md cursor-pointer',
              )}
            >
              <span>Sign In to {role === 'staff' ? 'Staff Portal' : 'Student Portal'}</span>
              <ArrowRight className="size-4 shrink-0" />
            </button>
          </form>

          <div className="mt-6 border-t border-[var(--nestora-sage-muted)] pt-5 text-center">
            <p className="text-caption text-muted-foreground">
              New university?{' '}
              <Link
                href="/register"
                className="font-semibold text-[var(--nestora-forest)] hover:underline"
              >
                Create a 30-day campus trial
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-caption text-muted-foreground">
          <ShieldCheck className="size-4 text-[var(--nestora-sage)]" />
          <span>Role-Based Access Control (RBAC) · 256-Bit TLS</span>
        </div>
      </div>
    </main>
  );
}
