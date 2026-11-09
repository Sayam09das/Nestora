import {
  ArrowRight,
  BedDouble,
  Clock,
  Fingerprint,
  HeartHandshake,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { createPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';

export const metadata = createPageMetadata({
  title: 'About Nestora — University Hostel Management Platform',
  description:
    'Learn how Nestora is transforming university residence operations through automated room allocations, biometric gate logs, and fee audits.',
  path: '/about',
});

const stats = [
  { value: '180+', label: 'University Residences', detail: 'Campuses running daily on Nestora' },
  {
    value: '85,000+',
    label: 'Student Beds Managed',
    detail: 'Real-time digital occupancy tracking',
  },
  { value: '99.98%', label: 'Platform Availability', detail: 'High-availability infrastructure' },
  {
    value: '4.2M+',
    label: 'Verified Gate Movements',
    detail: 'Zero curfew tracking discrepancies',
  },
];

const pillars = [
  {
    icon: BedDouble,
    title: 'Precise Bed & Room Allocations',
    description:
      'Eliminate manual occupancy spreadsheets. Nestora maps universities into organized hierarchies of hostels, blocks, floors, rooms, and individual beds with automated eligibility checks.',
  },
  {
    icon: Fingerprint,
    title: 'Real-Time Biometric Gate Security',
    description:
      'Sync turnstile RFID/biometric hardware with digital student leave approvals, giving wardens instant alerts for curfew compliance and automated guardian notification.',
  },
  {
    icon: ReceiptText,
    title: 'Transparent Institutional Ledger',
    description:
      'Track semester fee payments, security deposit refunds, mess charges, and pending dues with verifiable digital receipts and accountant-friendly reconciliation reports.',
  },
  {
    icon: Users,
    title: 'Strict Role-Based Data Isolation',
    description:
      'Purpose-built interfaces for Administrators, Wardens, Students, and Accountants ensure every user operates within their exact institutional authority with zero data leakage.',
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-w-0 overflow-x-clip bg-background pb-20 pt-10 sm:pb-28 sm:pt-14">
      {/* 21st.dev Ambient Aurora Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-full max-w-5xl -translate-x-1/2 opacity-75 blur-3xl hero-aura-ambient"
        aria-hidden
      />

      <div className="mx-auto max-w-[var(--container-marketing)] px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-card px-3.5 py-1 text-caption font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)] shadow-2xs">
            <Sparkles className="size-3 text-[var(--nestora-gold)]" />
            Our Mission
          </span>

          <h1 className="mt-4 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[2.75rem] sm:leading-[1.12]">
            Modernizing Campus Living for the Next Generation of Higher Education.
          </h1>

          <p className="mt-6 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)] sm:text-lg">
            For decades, university hostels have relied on scattered paper registers, physical leave
            slips, and manual fee receipts. Nestora was founded to bring modern, secure, and humane
            software architecture to residential campus operations.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="mt-14 sm:mt-16 rounded-2xl border border-[var(--nestora-sage-muted)] bg-card p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:divide-x lg:divide-[var(--nestora-sage-muted)]">
            {stats.map((s, index) => (
              <div key={s.label} className={cn('text-center lg:px-6', index === 0 && 'lg:pl-0')}>
                <p className="text-stat font-bold tabular-nums text-[var(--nestora-forest)] sm:text-[2.75rem]">
                  {s.value}
                </p>
                <p className="mt-1 text-label font-semibold text-foreground">{s.label}</p>
                <p className="mt-1 text-caption text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Problem & Solution Story */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-6">
            <span className="text-label font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)]">
              The Problem We Solve
            </span>
            <h2 className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)]">
              Campus Housing is Mission-Critical, Yet Historically Underserved.
            </h2>
            <p className="mt-4 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
              When thousands of students live on campus, wardens are tasked with impossible
              administrative burdens: managing room keys, verifying midnight gate movements, chasing
              unpaid hostel dues, and addressing plumbing or electrical repairs—often relying on
              WhatsApp groups and physical notebooks.
            </p>
            <p className="mt-4 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
              Nestora unifies these operations into a cohesive system. Wardens get real-time
              occupancy visibility, students get a transparent portal for leave and complaint
              tracking, and university leadership gains audit-ready compliance data.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_60%,var(--nestora-white))] p-6 sm:p-8">
              <h3 className="text-h4 font-semibold text-[var(--nestora-forest)]">
                Our Institutional Commitments
              </h3>
              <ul className="mt-4 space-y-3.5 text-supporting text-[var(--nestora-nav-muted)]">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="size-5 text-[var(--nestora-sage)] shrink-0 mt-0.5" />
                  <span>
                    <strong>Student Privacy First:</strong> Strict compliance with data protection
                    laws. Student personal contacts and guardian data are encrypted at rest and in
                    transit.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="size-5 text-[var(--nestora-tan)] shrink-0 mt-0.5" />
                  <span>
                    <strong>Rapid Deployment:</strong> Campuses can onboard existing student rosters
                    and room directories in under 48 hours with our migration specialists.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HeartHandshake className="size-5 text-[var(--nestora-sage)] shrink-0 mt-0.5" />
                  <span>
                    <strong>Dedicated Warden Support:</strong> 24/7 technical assistance for campus
                    housing teams during admission intakes and semester check-in rushes.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* The 4 Architectural Pillars */}
        <div className="mt-20 sm:mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-label font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)]">
              Core Architecture
            </span>
            <h2 className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)]">
              Built on Modern Software Principles.
            </h2>
            <p className="mt-4 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
              Engineered from the ground up to handle high-concurrency admission spikes and
              continuous daily movements across large university campuses.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-[var(--nestora-sage-muted)] bg-card p-6 sm:p-7 shadow-xs transition-shadow hover:shadow-md"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--nestora-sage-light)] text-[var(--nestora-forest)]">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-h4 font-semibold text-[var(--nestora-forest)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-supporting leading-relaxed text-[var(--nestora-nav-muted)]">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 sm:mt-28 rounded-2xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-forest)_96%,var(--nestora-white))] p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-h2 font-semibold tracking-tight text-white sm:text-[2.25rem]">
            Ready to Bring Nestora to Your University?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-body leading-relaxed text-emerald-100">
            Join over 180 institutions managing residential student life with confidence,
            transparency, and speed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className={cn(
                'inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 text-supporting font-semibold text-[var(--nestora-forest)] hover:bg-neutral-100 transition-colors',
              )}
            >
              <span>Start Free Campus Trial</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className={cn(
                'inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 text-supporting font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-xs',
              )}
            >
              <span>Talk to Solutions Team</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
