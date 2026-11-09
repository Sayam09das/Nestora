'use client';

import { ArrowRight, CheckCircle2, Clock, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({
    adminName: '',
    email: '',
    phone: '',
    institution: '',
    bedsCount: '500 - 1,500 beds',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(true);
  };

  return (
    <main className="relative min-w-0 overflow-x-clip bg-background pb-20 pt-10 sm:pb-28 sm:pt-14">
      {/* 21st.dev Ambient Aurora Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-full max-w-5xl -translate-x-1/2 opacity-75 blur-3xl hero-aura-ambient"
        aria-hidden
      />

      <div className="mx-auto max-w-[var(--container-marketing)] px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-20">
          {/* Left Column: Trial Benefits & Trust */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-card px-3.5 py-1 text-caption font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)] shadow-2xs">
              <Sparkles className="size-3 text-[var(--nestora-gold)]" />
              30-Day Campus Trial
            </span>

            <h1 className="mt-4 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[2.5rem] sm:leading-[1.12]">
              Start Your Free Institutional Workspace.
            </h1>

            <p className="mt-4 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
              Experience the full power of Nestora on your campus. Provision buildings, allocate
              student beds, generate digital gate passes, and audit fees—all in one workspace.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3 rounded-xl border border-[var(--nestora-sage-muted)] bg-card/80 p-4">
                <CheckCircle2 className="size-5 text-[var(--nestora-sage)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-supporting font-semibold text-[var(--nestora-forest)]">
                    All 8 Modules Unlocked
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Bed allocations, gate pass logs, leave management, fee settlements, and student
                    grievances.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 rounded-xl border border-[var(--nestora-sage-muted)] bg-card/80 p-4">
                <ShieldCheck className="size-5 text-[var(--nestora-sage)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-supporting font-semibold text-[var(--nestora-forest)]">
                    No Credit Card & Zero Commitment
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Try Nestora risk-free for 30 days. No automatic billing or hidden contracts.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 rounded-xl border border-[var(--nestora-sage-muted)] bg-card/80 p-4">
                <Clock className="size-5 text-[var(--nestora-tan)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-supporting font-semibold text-[var(--nestora-forest)]">
                    Spreadsheet Importer Included
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Upload your current student and room roster in minutes using our Excel/CSV
                    migration tool.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 border-t border-[var(--nestora-sage-muted)] pt-6 flex items-center gap-3 text-caption text-muted-foreground">
              <Lock className="size-4 text-[var(--nestora-sage)] shrink-0" />
              <span>Protected by university-grade encryption & ISO 27001 compliant hosting.</span>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--nestora-sage-muted)] bg-card p-6 shadow-xl sm:p-8">
              {created ? (
                <div className="py-12 text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-8" />
                  </span>
                  <h3 className="mt-4 text-h3 font-semibold text-[var(--nestora-forest)]">
                    Campus Workspace Provisioned!
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-pretty text-supporting text-muted-foreground">
                    Welcome to Nestora, {form.adminName}. Your workspace for{' '}
                    <strong>{form.institution}</strong> is ready. We’ve sent verification
                    credentials to <strong>{form.email}</strong>.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/login"
                      className={cn(
                        nestoraPrimaryCtaClasses,
                        'h-11 w-full sm:w-auto px-6 text-supporting shadow-sm',
                      )}
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-border pb-4">
                    <h2 className="text-h4 font-semibold text-[var(--nestora-forest)] sm:text-h3">
                      Create Your Institutional Account
                    </h2>
                    <p className="mt-1 text-caption text-muted-foreground">
                      Get full administrative access to your new campus management portal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="adminName"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        id="adminName"
                        required
                        placeholder="Dr. Anand Verma"
                        value={form.adminName}
                        onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Official Institutional Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        placeholder="admin@university.edu"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="institution"
                        className="block text-caption font-semibold text-foreground"
                      >
                        University / College Name *
                      </label>
                      <input
                        type="text"
                        id="institution"
                        required
                        placeholder="Apex Institute of Technology"
                        value={form.institution}
                        onChange={(e) => setForm({ ...form, institution: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Direct Phone / Mobile *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        placeholder="+91 98765 01234"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="bedsCount"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Estimated Residential Beds
                      </label>
                      <select
                        id="bedsCount"
                        value={form.bedsCount}
                        onChange={(e) => setForm({ ...form, bedsCount: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      >
                        <option>Under 500 beds</option>
                        <option>500 - 1,500 beds</option>
                        <option>1,500 - 3,500 beds</option>
                        <option>3,500+ beds</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Create Master Password *
                      </label>
                      <input
                        type="password"
                        id="password"
                        required
                        minLength={8}
                        placeholder="••••••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-caption text-muted-foreground">
                      <input
                        type="checkbox"
                        required
                        defaultChecked
                        className="mt-0.5 size-4 rounded border-border text-[var(--nestora-forest)] focus:ring-[var(--nestora-sage)]"
                      />
                      <span>
                        I confirm I am an authorized institutional representative and agree to
                        Nestora’s Terms of Service and Privacy Policy.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className={cn(
                      nestoraPrimaryCtaClasses,
                      'h-12 w-full justify-center px-8 text-supporting shadow-md cursor-pointer',
                    )}
                  >
                    <span>Create Campus Workspace</span>
                    <ArrowRight className="size-4 shrink-0" />
                  </button>

                  <p className="pt-2 text-center text-caption text-muted-foreground">
                    Already registered?{' '}
                    <Link
                      href="/login"
                      className="font-semibold text-[var(--nestora-forest)] hover:underline"
                    >
                      Sign in to your portal
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
