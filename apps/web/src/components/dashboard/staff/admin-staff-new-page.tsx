'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, UserPlus, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  DEPARTMENT_FILTER_OPTIONS,
  HOSTEL_STAFF_FILTER_OPTIONS,
  ROLE_FILTER_OPTIONS,
} from '@/components/dashboard/staff/admin-staff-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const STEPS = [
  'Personal Information',
  'Employment Details',
  'Hostel & Assignment',
  'Account Setup',
] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

let staffSeq = 28;
function generateStaffId() {
  staffSeq += 1;
  return `STF-${String(staffSeq).padStart(3, '0')}`;
}

export function AdminStaffNewPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [staffId] = useState(generateStaffId);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: '',
    department: '',
    location: '',
    loginEmail: '',
  });

  const progress = (step / STEPS.length) * 100;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-staff-reg]'), {
        opacity: 0,
        y: 12,
        duration: 0.38,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [step, reduceMotion] },
  );

  const patch = (partial: Partial<typeof form>) => setForm((p) => ({ ...p, ...partial }));

  const handleCreate = () => {
    toast.success('Staff member registered', {
      description: `${form.firstName} ${form.lastName} (${staffId}) — invitation sent.`,
    });
    router.push('/admin/staff');
  };

  return (
    <div ref={rootRef} className="mx-auto max-w-3xl space-y-6 pb-10">
      <header data-staff-reg className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
          Dashboard / Staff / Add Member
        </p>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-muted/30">
            <UserCog className="size-5 text-[var(--nestora-forest)]" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Add Staff Member</h1>
            <p className="text-sm text-muted-foreground">Onboard housing and campus operations staff.</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Step {step} of {STEPS.length}: {STEPS[step - 1]}
        </p>
        <Progress value={progress} className="mt-2 gap-0">
          <ProgressTrack className="h-1.5 rounded-full bg-[#e7e7dc]">
            <ProgressIndicator className="rounded-full bg-[#6d9773]" />
          </ProgressTrack>
        </Progress>
      </header>

      <motion.section
        key={step}
        data-staff-reg
        initial={reduceMotion ? false : { opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-5 shadow-sm"
      >
        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First Name" value={form.firstName} onChange={(v) => patch({ firstName: v })} required />
            <Field label="Last Name" value={form.lastName} onChange={(v) => patch({ lastName: v })} required />
            <Field label="Phone" value={form.phone} onChange={(v) => patch({ phone: v })} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => patch({ email: v })} required />
          </div>
        ) : null}
        {step === 2 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Staff ID" value={staffId} onChange={() => {}} readOnly />
            <SelectField
              label="Role"
              value={form.role}
              onChange={(v) => patch({ role: v })}
              options={ROLE_FILTER_OPTIONS.filter((o) => o !== 'All Roles')}
            />
            <SelectField
              label="Department"
              value={form.department}
              onChange={(v) => patch({ department: v })}
              options={DEPARTMENT_FILTER_OPTIONS.filter((o) => o !== 'All Departments')}
            />
          </div>
        ) : null}
        {step === 3 ? (
          <SelectField
            label="Primary location / hostel"
            value={form.location}
            onChange={(v) => patch({ location: v })}
            options={HOSTEL_STAFF_FILTER_OPTIONS.filter((o) => o !== 'All Locations')}
          />
        ) : null}
        {step === 4 ? (
          <div className="space-y-3">
            <Field label="Login email" type="email" value={form.loginEmail} onChange={(v) => patch({ loginEmail: v })} required />
            <p className="text-sm text-muted-foreground">
              An invitation link is sent — no passwords are collected in this form.
            </p>
          </div>
        ) : null}
      </motion.section>

      <footer data-staff-reg className="flex flex-wrap justify-between gap-2">
        <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href="/admin/staff" />}>
          <ArrowLeft className="size-4" aria-hidden />
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => toast.success('Draft saved locally')}>
            <Save className="size-4" aria-hidden />
            Save draft
          </Button>
          {step > 1 ? (
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length ? (
            <Button type="button" className="rounded-xl bg-[var(--nestora-forest)]" onClick={() => setStep((s) => s + 1)}>
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="button" className="rounded-xl bg-[var(--nestora-forest)]" onClick={handleCreate}>
              <UserPlus className="size-4" aria-hidden />
              Create staff
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
        {required ? ' *' : ''}
      </span>
      <Input
        type={type}
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-10 rounded-xl', readOnly && 'bg-muted/50')}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label} *</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-10 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 text-sm', focusRing)}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
