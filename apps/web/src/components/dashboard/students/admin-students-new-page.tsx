'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookUser,
  Building2,
  Check,
  FileUp,
  GraduationCap,
  MapPin,
  Save,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import {
  ACADEMIC_YEARS,
  ACCOUNT_STATUS_OPTIONS,
  COURSE_OPTIONS,
  createEmptyRegistrationForm,
  DRAFT_STORAGE_KEY,
  GENDER_OPTIONS,
  generateStudentId,
  getBedsForRoom,
  getRoomsForHostel,
  HOSTEL_OPTIONS,
  REGISTRATION_STEPS,
  RELATIONSHIP_OPTIONS,
  STAY_DURATION_OPTIONS,
  validateAllSteps,
  validateDocumentFile,
  validatePhotoFile,
  validateRegistrationStep,
  type StudentRegistrationForm,
} from '@/components/dashboard/students/admin-students-registration-constants';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { uploadStudentDocument, uploadStudentProfilePhoto } from '@/lib/api/uploads';
import { registerStudent } from '@/lib/api/students';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const STEP_ICONS = [Users, GraduationCap, MapPin, Users, Building2, ShieldCheck] as const;

type DraftPayload = {
  form: StudentRegistrationForm;
  step: number;
  savedAt: string;
};

export function AdminStudentsNewPage() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const stepPanelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StudentRegistrationForm>(() => createEmptyRegistrationForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [documentsUploading, setDocumentsUploading] = useState(false);

  const progressPct = useMemo(() => (step / REGISTRATION_STEPS.length) * 100, [step]);

  const rooms = useMemo(() => getRoomsForHostel(form.hostel), [form.hostel]);
  const beds = useMemo(() => getBedsForRoom(form.hostel, form.roomNumber), [form.hostel, form.roomNumber]);

  const patch = useCallback((partial: Partial<StudentRegistrationForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const draft = JSON.parse(raw) as DraftPayload;
      if (draft?.form) {
        setForm({ ...createEmptyRegistrationForm(), ...draft.form, studentId: draft.form.studentId || generateStudentId() });
        if (draft.step && draft.step >= 1 && draft.step <= 6) {
          setStep(draft.step);
        }
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) {
        return;
      }
      gsap.from(rootRef.current.querySelectorAll('[data-reg-reveal]'), {
        opacity: 0,
        y: 14,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  useGSAP(
    () => {
      if (reduceMotion || !stepPanelRef.current) {
        return;
      }
      gsap.from(stepPanelRef.current.querySelectorAll('[data-reg-field]'), {
        opacity: 0,
        y: 10,
        duration: 0.32,
        stagger: 0.04,
        ease: 'power1.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: stepPanelRef, dependencies: [step, reduceMotion] },
  );

  const clearStepErrors = () => setErrors({});

  const runStepValidation = (targetStep: number) => {
    const stepErrors = validateRegistrationStep(targetStep, form);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (!runStepValidation(step)) {
      errorSummaryRef.current?.focus();
      return;
    }
    clearStepErrors();
    setStep((s) => Math.min(REGISTRATION_STEPS.length, s + 1));
  };

  const goBack = () => {
    clearStepErrors();
    setStep((s) => Math.max(1, s - 1));
  };

  const goToStep = (target: number) => {
    if (target === step) {
      return;
    }
    clearStepErrors();
    setStep(target);
  };

  const saveDraft = () => {
    const payload: DraftPayload = {
      form,
      step,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    toast.success('Draft saved on this device');
  };

  const handleCreate = async () => {
    const allErrors = validateAllSteps(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstStep = REGISTRATION_STEPS.find((s) =>
        Object.keys(validateRegistrationStep(s.id, form)).length > 0,
      );
      if (firstStep) {
        setStep(firstStep.id);
      }
      errorSummaryRef.current?.focus();
      return;
    }

    setSubmitting(true);
    const result = await registerStudent(form);
    setSubmitting(false);
    if (!result.ok) {
      toast.error('Could not register student', { description: result.message });
      return;
    }
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    toast.success('Student registered — invitation sent to set password', {
      description: `${form.firstName} ${form.lastName} (${form.rollNumber.trim() || form.studentId})`,
    });
    router.push(result.userId ? `/admin/students/${result.userId}` : '/admin/students');
  };

  const onPhotoChange = async (file: File | undefined) => {
    setFileError(null);
    if (!file) {
      patch({ profilePhotoName: '', profilePhotoObjectKey: '', profilePhotoUrl: '' });
      return;
    }
    const err = validatePhotoFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    setPhotoUploading(true);
    const result = await uploadStudentProfilePhoto(file);
    setPhotoUploading(false);
    if (!result.upload) {
      setFileError(result.error ?? 'Photo upload failed.');
      return;
    }
    patch({
      profilePhotoName: result.upload.fileName,
      profilePhotoObjectKey: result.upload.objectKey,
      profilePhotoUrl: result.upload.publicUrl,
    });
  };

  const onDocumentsChange = async (files: FileList | null) => {
    setFileError(null);
    if (!files?.length) {
      patch({ documentNames: [], documentUploads: [] });
      return;
    }
    const uploads: StudentRegistrationForm['documentUploads'] = [];
    const names: string[] = [];
    setDocumentsUploading(true);
    for (const file of Array.from(files)) {
      const err = validateDocumentFile(file);
      if (err) {
        setDocumentsUploading(false);
        setFileError(`${file.name}: ${err}`);
        return;
      }
      const result = await uploadStudentDocument(file);
      if (!result.upload) {
        setDocumentsUploading(false);
        setFileError(result.error ?? `Could not upload ${file.name}.`);
        return;
      }
      uploads.push({
        objectKey: result.upload.objectKey,
        fileName: result.upload.fileName,
        mimeType: result.upload.mimeType,
        fileSize: result.upload.sizeBytes,
      });
      names.push(result.upload.fileName);
    }
    setDocumentsUploading(false);
    patch({ documentNames: names, documentUploads: uploads });
  };

  const errorEntries = Object.entries(errors);

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <header
        data-reg-reveal
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[#6d9773]" aria-hidden />
        <div className="flex flex-wrap items-start justify-between gap-4 pl-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
              Dashboard / Students / Add Student
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)]">Add New Student</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">New Registration</span> — register a student and assign
              hostel accommodation.
            </p>
          </div>
          <Button
            nativeButton={false}
            variant="outline"
            className="rounded-xl"
            render={<Link href="/admin/students" />}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to directory
          </Button>
        </div>
        <div className="mt-5 pl-2">
          <motion.div
            animate={reduceMotion ? undefined : { width: `${progressPct}%` }}
            className="mb-2 flex items-center justify-between text-xs text-muted-foreground"
          >
            <span>
              Step <span className="font-semibold text-foreground">{step}</span> of {REGISTRATION_STEPS.length}
            </span>
            <span className="font-medium text-[var(--nestora-forest)]">{REGISTRATION_STEPS[step - 1]?.title}</span>
          </motion.div>
          <Progress value={progressPct} className="gap-0">
            <ProgressTrack className="h-1.5 rounded-full bg-[#e7e7dc]">
              <ProgressIndicator className="rounded-full bg-[linear-gradient(90deg,#6d9773,#3d5a45)]" />
            </ProgressTrack>
          </Progress>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr]">
        <nav data-reg-reveal aria-label="Registration steps" className="space-y-2 lg:sticky lg:top-6 lg:self-start">
          {REGISTRATION_STEPS.map((s) => {
            const Icon = STEP_ICONS[s.id - 1] ?? Users;
            const active = s.id === step;
            const done = s.id < step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-[border-color,background-color,box-shadow] duration-200',
                  focusRing,
                  active
                    ? 'border-[color-mix(in_oklch,var(--nestora-sage)_48%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--card))] shadow-sm ring-2 ring-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)]'
                    : done
                      ? 'border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-card hover:bg-muted/30'
                      : 'border-[var(--nestora-sage-muted)]/80 bg-card hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
                    active
                      ? 'border-[var(--nestora-forest)] bg-[var(--nestora-forest)] text-white'
                      : done
                        ? 'border-[#6d9773] bg-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--card))] text-[var(--nestora-forest)]'
                        : 'border-border text-muted-foreground',
                  )}
                >
                  {done && !active ? <Check className="size-4 text-[#6d9773]" aria-hidden /> : s.id}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{s.short}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{s.title}</span>
                </span>
                <Icon className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-4">
          {errorEntries.length > 0 ? (
            <div
              ref={errorSummaryRef}
              role="alert"
              tabIndex={-1}
              aria-labelledby="reg-error-title"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
            >
              <h2 id="reg-error-title" className="text-sm font-semibold text-destructive">
                Please fix {errorEntries.length} field{errorEntries.length > 1 ? 's' : ''}
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive/90">
                {errorEntries.map(([key, msg]) => (
                  <li key={key}>
                    <a href={`#field-${key}`} className="underline underline-offset-2">
                      {msg}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {fileError ? (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
              {fileError}
            </p>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.section
              key={step}
              ref={stepPanelRef}
              data-reg-reveal
              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
              transition={{ duration: 0.28, ease: motionEase }}
              className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-5 shadow-sm sm:p-6"
              aria-labelledby="reg-step-title"
            >
              <h2 id="reg-step-title" className="text-lg font-semibold text-[var(--nestora-forest)]">
                {step}. {REGISTRATION_STEPS[step - 1]?.title}
              </h2>

              {step === 1 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FieldBlock label="Profile Photo" className="sm:col-span-2">
                    <motion.div whileHover={reduceMotion ? undefined : { scale: 1.005 }} className="rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-card/90 p-4">
                      <p className="text-sm font-medium text-foreground">Upload JPG or PNG, max 2 MB</p>
                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted/30">
                        <FileUp className="size-4" aria-hidden />
                        {photoUploading ? 'Uploading…' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="sr-only"
                          disabled={photoUploading}
                          onChange={(e) => void onPhotoChange(e.target.files?.[0])}
                        />
                      </label>
                      {form.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.profilePhotoUrl}
                          alt="Profile preview"
                          className="mt-3 size-20 rounded-xl border border-[var(--nestora-sage-muted)] object-cover"
                        />
                      ) : null}
                      {form.profilePhotoName ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Stored in Neon bucket ({form.profilePhotoName})
                        </p>
                      ) : null}
                    </motion.div>
                  </FieldBlock>
                  <FormField id="firstName" label="First Name" required error={errors.firstName} value={form.firstName} onChange={(v) => patch({ firstName: v })} />
                  <FormField id="lastName" label="Last Name" required error={errors.lastName} value={form.lastName} onChange={(v) => patch({ lastName: v })} />
                  <FormField id="dateOfBirth" label="Date of Birth" required type="date" error={errors.dateOfBirth} value={form.dateOfBirth} onChange={(v) => patch({ dateOfBirth: v })} />
                  <SelectField id="gender" label="Gender" required error={errors.gender} value={form.gender} onChange={(v) => patch({ gender: v })} options={GENDER_OPTIONS} placeholder="Select gender" />
                  <FormField id="phone" label="Phone Number" required error={errors.phone} value={form.phone} onChange={(v) => patch({ phone: v })} />
                  <FormField id="email" label="Email Address" required type="email" error={errors.email} value={form.email} onChange={(v) => patch({ email: v })} />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FieldBlock label="Student ID" required error={errors.studentId} className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      <Input id="field-studentId" readOnly value={form.studentId} className="h-10 max-w-xs rounded-xl bg-muted/50 font-mono tabular-nums" aria-describedby="student-id-hint" />
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => patch({ studentId: generateStudentId() })}>
                        Regenerate
                      </Button>
                    </div>
                    <p id="student-id-hint" className="mt-1 text-xs text-muted-foreground">
                      Generated automatically to avoid duplicate IDs.
                    </p>
                  </FieldBlock>
                  <FormField id="admissionDate" label="Admission Date" required type="date" error={errors.admissionDate} value={form.admissionDate} onChange={(v) => patch({ admissionDate: v })} />
                  <SelectField id="course" label="Course / Department" required error={errors.course} value={form.course} onChange={(v) => patch({ course: v })} options={COURSE_OPTIONS} placeholder="Select course" />
                  <SelectField id="academicYear" label="Academic Year" required error={errors.academicYear} value={form.academicYear} onChange={(v) => patch({ academicYear: v })} options={ACADEMIC_YEARS} placeholder="Select year" />
                  <FormField id="college" label="College / University" value={form.college} onChange={(v) => patch({ college: v })} />
                  <FormField id="rollNumber" label="Roll Number" value={form.rollNumber} onChange={(v) => patch({ rollNumber: v })} />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FieldBlock label="Full Address" required error={errors.fullAddress} className="sm:col-span-2">
                    <Textarea
                      id="field-fullAddress"
                      value={form.fullAddress}
                      onChange={(e) => patch({ fullAddress: e.target.value })}
                      rows={3}
                      className="rounded-xl border-[var(--nestora-sage-muted)]"
                    />
                  </FieldBlock>
                  <FormField id="city" label="City" required error={errors.city} value={form.city} onChange={(v) => patch({ city: v })} />
                  <FormField id="state" label="State" required error={errors.state} value={form.state} onChange={(v) => patch({ state: v })} />
                  <FormField id="pinCode" label="PIN Code" required error={errors.pinCode} value={form.pinCode} onChange={(v) => patch({ pinCode: v })} inputMode="numeric" />
                  <FormField id="country" label="Country" value={form.country} onChange={(v) => patch({ country: v })} />
                </div>
              ) : null}

              {step === 4 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FormField id="guardianName" label="Guardian Name" required error={errors.guardianName} value={form.guardianName} onChange={(v) => patch({ guardianName: v })} />
                  <SelectField id="relationship" label="Relationship" required error={errors.relationship} value={form.relationship} onChange={(v) => patch({ relationship: v })} options={RELATIONSHIP_OPTIONS} placeholder="Select" />
                  <FormField id="guardianPhone" label="Guardian Phone" required error={errors.guardianPhone} value={form.guardianPhone} onChange={(v) => patch({ guardianPhone: v })} />
                  <FormField id="guardianEmail" label="Guardian Email" type="email" error={errors.guardianEmail} value={form.guardianEmail} onChange={(v) => patch({ guardianEmail: v })} />
                  <FieldBlock label="Guardian Address" className="sm:col-span-2">
                    <Textarea value={form.guardianAddress} onChange={(e) => patch({ guardianAddress: e.target.value })} rows={2} className="rounded-xl border-[var(--nestora-sage-muted)]" />
                  </FieldBlock>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <SelectField
                    id="hostel"
                    label="Hostel"
                    required
                    error={errors.hostel}
                    value={form.hostel}
                    onChange={(v) => {
                      patch({ hostel: v, roomNumber: '', bedNumber: '', roomAllocationStatus: 'Unassigned' });
                    }}
                    options={HOSTEL_OPTIONS}
                    placeholder="Select hostel"
                  />
                  <SelectField
                    id="roomNumber"
                    label="Room Number"
                    required
                    error={errors.roomNumber}
                    value={form.roomNumber}
                    onChange={(v) => patch({ roomNumber: v, bedNumber: '' })}
                    options={rooms.map((r) => r.id)}
                    optionLabels={Object.fromEntries(rooms.map((r) => [r.id, r.label]))}
                    placeholder="Select room"
                    disabled={!form.hostel}
                  />
                  <SelectField
                    id="bedNumber"
                    label="Bed Number"
                    required
                    error={errors.bedNumber}
                    value={form.bedNumber}
                    onChange={(v) => patch({ bedNumber: v, roomAllocationStatus: v ? 'Allocated' : 'Unassigned' })}
                    options={beds}
                    placeholder="Select bed"
                    disabled={!form.roomNumber}
                  />
                  <FormField id="checkInDate" label="Check-in Date" type="date" value={form.checkInDate} onChange={(v) => patch({ checkInDate: v })} />
                  <SelectField id="stayDuration" label="Stay Duration" value={form.stayDuration} onChange={(v) => patch({ stayDuration: v })} options={STAY_DURATION_OPTIONS} placeholder="Select duration" />
                  <p className="sm:col-span-2 text-xs text-muted-foreground">
                    Only available beds are listed. Room allocation status ({form.roomAllocationStatus}) is separate from
                    account activation in step 6.
                  </p>
                </div>
              ) : null}

              {step === 6 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FormField id="loginEmail" label="Login Email" required type="email" error={errors.loginEmail} value={form.loginEmail} onChange={(v) => patch({ loginEmail: v })} />
                  <SelectField id="accountStatus" label="Account Status" required error={errors.accountStatus} value={form.accountStatus} onChange={(v) => patch({ accountStatus: v })} options={ACCOUNT_STATUS_OPTIONS} />
                  <FieldBlock label="Upload Documents" className="sm:col-span-2">
                    <div className="rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-card/90 p-4">
                      <p className="text-sm font-medium">Upload student documents</p>
                      <p className="text-xs text-muted-foreground">Photo ID, admission proof, and other supporting documents (JPG, PNG, PDF — 5 MB each)</p>
                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted/30">
                        <BookUser className="size-4" aria-hidden />
                        {documentsUploading ? 'Uploading…' : 'Choose Files'}
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,application/pdf"
                          className="sr-only"
                          disabled={documentsUploading}
                          onChange={(e) => void onDocumentsChange(e.target.files)}
                        />
                      </label>
                      {form.documentNames.length > 0 ? (
                        <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                          {form.documentNames.map((name) => (
                            <li key={name}>{name} (Neon private bucket)</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </FieldBlock>
                  <div className="sm:col-span-2 rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card/90 px-4 py-3 text-sm text-muted-foreground">
                    <p className="font-medium text-[var(--nestora-forest)]">Secure account setup</p>
                    <p className="mt-1">
                      No passwords are collected here. After you create the student, Nestora sends an invitation link so
                      they can set their password securely.
                    </p>
                  </div>
                </div>
              ) : null}
            </motion.section>
          </AnimatePresence>

          <footer data-reg-reveal className="flex flex-col gap-3 rounded-2xl border border-[var(--nestora-sage-muted)]/80 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-muted-foreground" role="note">
              Illustrative form preview; wire Nestora APIs for production registration.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" nativeButton={false} render={<Link href="/admin/students" />}>
                Cancel
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={saveDraft}>
                <Save className="size-4" aria-hidden />
                Save Draft
              </Button>
              {step > 1 ? (
                <Button type="button" variant="outline" className="rounded-xl" onClick={goBack}>
                  <ArrowLeft className="size-4" aria-hidden />
                  Back
                </Button>
              ) : null}
              {step < REGISTRATION_STEPS.length ? (
                <Button type="button" className="rounded-xl bg-[var(--nestora-forest)] hover:bg-[var(--nestora-forest)]/90" onClick={goNext}>
                  Continue
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={submitting}
                  className="rounded-xl bg-[var(--nestora-forest)] hover:bg-[var(--nestora-forest)]/90"
                  onClick={handleCreate}
                >
                  <UserPlus className="size-4" aria-hidden />
                  {submitting ? 'Creating…' : 'Create Student'}
                </Button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-reg-field className={cn('flex flex-col gap-1.5', className)}>
      <Label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FormField({
  id,
  label,
  required,
  error,
  value,
  onChange,
  type = 'text',
  inputMode,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <FieldBlock label={label} required={required} error={error}>
      <Input
        id={`field-${id}`}
        data-reg-field
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-10 rounded-xl border-[var(--nestora-sage-muted)]', error && 'border-destructive')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FieldBlock>
  );
}

function SelectField({
  id,
  label,
  required,
  error,
  value,
  onChange,
  options,
  optionLabels,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <FieldBlock label={label} required={required} error={error}>
      <select
        id={`field-${id}`}
        data-reg-field
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 w-full rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 text-sm',
          error && 'border-destructive',
          disabled && 'opacity-60',
          focusRing,
        )}
        aria-invalid={Boolean(error)}
      >
        <option value="">{placeholder ?? 'Select'}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {optionLabels?.[opt] ?? opt}
          </option>
        ))}
      </select>
    </FieldBlock>
  );
}
