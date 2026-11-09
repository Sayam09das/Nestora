'use client';

import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    phone: '',
    institution: '',
    role: 'Warden / Administrator',
    campusSize: '1,000 - 3,000 beds',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="relative min-w-0 overflow-x-clip bg-background pb-20 pt-10 sm:pb-28 sm:pt-14">
      {/* 21st.dev Ambient Aurora Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 opacity-70 blur-3xl hero-aura-ambient"
        aria-hidden
      />

      <div className="mx-auto max-w-[var(--container-marketing)] px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-20">
          {/* Left Column: Context, Channels, and Direct Support */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-card px-3.5 py-1 text-caption font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)] shadow-2xs">
              <Sparkles className="size-3 text-[var(--nestora-gold)]" />
              Get in Touch
            </span>

            <h1 className="mt-4 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[2.5rem] sm:leading-[1.12]">
              Let’s Modernize Your Campus Residence.
            </h1>

            <p className="mt-4 text-pretty text-body leading-relaxed text-[var(--nestora-nav-muted)]">
              Have questions about multi-building allocations, biometric turnstile integration, or
              migrating legacy student data? Our university onboarding team responds within 24
              hours.
            </p>

            {/* Direct Contact Methods */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-card/80 p-4 backdrop-blur-xs">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--nestora-sage-light)] text-[var(--nestora-forest)]">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-caption font-semibold text-[var(--nestora-forest)]">
                    Official Inquiries & Support
                  </p>
                  <a
                    href="mailto:contact@nestora.app"
                    className="mt-0.5 block text-supporting font-medium text-[var(--nestora-sage)] hover:underline"
                  >
                    contact@nestora.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-card/80 p-4 backdrop-blur-xs">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--nestora-tan-light)] text-[var(--nestora-forest)]">
                  <Phone className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-caption font-semibold text-[var(--nestora-forest)]">
                    Institutional Phone Helpline
                  </p>
                  <p className="mt-0.5 text-supporting font-medium text-[var(--nestora-forest)]">
                    +91 (0) 80 4920 1820
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Mon–Fri · 9:00 AM – 6:00 PM IST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-card/80 p-4 backdrop-blur-xs">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--nestora-cream)] text-[var(--nestora-forest)]">
                  <MapPin className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-caption font-semibold text-[var(--nestora-forest)]">
                    Headquarters
                  </p>
                  <p className="mt-0.5 text-supporting text-muted-foreground">
                    Campus Tech Hub, 4th Floor, Indiranagar, Bengaluru, KA 560038
                  </p>
                </div>
              </div>
            </div>

            {/* SLA Reassurance */}
            <div className="mt-8 border-t border-[var(--nestora-sage-muted)] pt-6">
              <div className="flex items-center gap-2 text-caption text-muted-foreground">
                <Clock className="size-4 text-[var(--nestora-tan)]" />
                <span>
                  Average consultation turnaround: <strong>under 6 hours</strong>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-caption text-muted-foreground">
                <ShieldCheck className="size-4 text-[var(--nestora-sage)]" />
                <span>NDA & university data confidentiality signed upfront</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Consultation Request Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--nestora-sage-muted)] bg-card p-6 shadow-lg sm:p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-8" />
                  </span>
                  <h3 className="mt-4 text-h3 font-semibold text-[var(--nestora-forest)]">
                    Consultation Request Received
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-pretty text-supporting text-muted-foreground">
                    Thank you, {formData.fullName}. Our institutional specialist will contact you at{' '}
                    <strong>{formData.workEmail}</strong> shortly to schedule your personalized
                    walkthrough.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 inline-flex h-10 items-center rounded-full border border-border px-5 text-caption font-semibold text-[var(--nestora-forest)] hover:bg-muted cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-border pb-4">
                    <h2 className="text-h4 font-semibold text-[var(--nestora-forest)] sm:text-h3">
                      Request Institutional Walkthrough
                    </h2>
                    <p className="mt-1 text-caption text-muted-foreground">
                      Fill out the form below and we will prepare customized occupancy projections
                      for your institution.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        required
                        placeholder="Prof. Ramesh Iyer"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="workEmail"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Institutional Email *
                      </label>
                      <input
                        type="email"
                        id="workEmail"
                        required
                        placeholder="warden@university.edu"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
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
                        placeholder="National Institute of Technology"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Your Role / Designation
                      </label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      >
                        <option>Dean / Director of Student Affairs</option>
                        <option>Chief Warden / Hostel In-Charge</option>
                        <option>Hostel Administrator / Manager</option>
                        <option>Campus IT / Registrar</option>
                        <option>Finance Officer / Accountant</option>
                        <option>Other Institutional Representative</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="campusSize"
                        className="block text-caption font-semibold text-foreground"
                      >
                        Campus Residential Scale
                      </label>
                      <select
                        id="campusSize"
                        value={formData.campusSize}
                        onChange={(e) => setFormData({ ...formData, campusSize: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                      >
                        <option>Under 500 beds</option>
                        <option>500 - 1,500 beds</option>
                        <option>1,500 - 3,500 beds</option>
                        <option>3,500 - 7,000 beds</option>
                        <option>7,000+ beds (Multi-campus)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-caption font-semibold text-foreground"
                    >
                      Specific Operations or Modules of Interest
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      placeholder="e.g. We want to replace paper gate passes and automate bed allocations before the upcoming July intake..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-supporting text-foreground outline-none transition-colors focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[var(--nestora-sage)]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className={cn(
                      nestoraPrimaryCtaClasses,
                      'h-12 w-full justify-center px-8 text-supporting shadow-md cursor-pointer',
                    )}
                  >
                    <span>Request Campus Consultation</span>
                    <Send className="size-4 shrink-0" />
                  </button>

                  <p className="text-center text-[11px] text-muted-foreground">
                    By submitting, you agree to our privacy policy. We will never share
                    institutional records.
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
