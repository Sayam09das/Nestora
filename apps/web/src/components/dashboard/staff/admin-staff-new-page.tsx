'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookUser,
  Building2,
  Check,
  FileUp,
  HeartPulse,
  MapPin,
  Save,
  ShieldCheck,
  Briefcase,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import {
  ACCOUNT_STATUS_OPTIONS,
  COUNTRY_OPTIONS,
  createEmptyStaffForm,
  DEPARTMENT_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  generateEmployeeId,
  HOSTEL_BLOCKS,
  HOSTEL_FLOORS,
  IDENTITY_PROOF_OPTIONS,
  isHostelBasedRole,
  isSecurityRole,
  isWardenRole,
  JOB_TITLE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  STAFF_DRAFT_STORAGE_KEY,
  STAFF_REGISTRATION_STEPS,
  suggestedSystemRole,
  SYSTEM_ROLE_OPTIONS,
  validateAllStaffSteps,
  validateDocumentFile,
  validatePhotoFile,
  validateStaffStep,
  WARDEN_TYPE_OPTIONS,
  WORK_SHIFT_OPTIONS,
  type StaffDocumentUpload,
  type StaffRegistrationForm,
} from '@/components/dashboard/staff/admin-staff-registration-constants';
import { useStaffRegistrationFacets } from '@/hooks/use-staff-registration-facets';
import { fetchStudentDirectoryList } from '@/lib/api/students';
import { registerStaff } from '@/lib/api/staff';
import { getApiBaseUrl } from '@/lib/api/client';
import { uploadStaffDocument, uploadStaffProfilePhoto } from '@/lib/api/uploads';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const STEP_ICONS = [Users, Briefcase, Building2, MapPin, HeartPulse, BookUser, ShieldCheck] as const;

type DraftPayload = { form: StaffRegistrationForm; step: number; savedAt: string };

export function AdminStaffNewPage() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const stepPanelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StaffRegistrationForm>(() => createEmptyStaffForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const progressPct = useMemo(() => (step / STAFF_REGISTRATION_STEPS.length) * 100, [step]);
  const { hostelOptions, managerOptions, loading: facetsLoading } = useStaffRegistrationFacets();
  const [hostelStudentCount, setHostelStudentCount] = useState<number | null>(null);

  const blockOptions = useMemo(
    () => (form.assignedHostel ? HOSTEL_BLOCKS[form.assignedHostel] ?? ['—'] : []),
    [form.assignedHostel],
  );

  const stepComplete = useMemo(
    () => STAFF_REGISTRATION_STEPS.map((s) => Object.keys(validateStaffStep(s.id, form)).length === 0),
    [form],
  );

  const profilePhotoPreview = useMemo(() => {
    if (form.profilePhotoUrl) {
      return form.profilePhotoUrl;
    }
    if (form.profilePhotoObjectKey && getApiBaseUrl()) {
      const encoded = form.profilePhotoObjectKey.split('/').map(encodeURIComponent).join('/');
      return `${getApiBaseUrl()}/api/v1/uploads/staff-public/${encoded}`;
    }
    return null;
  }, [form.profilePhotoObjectKey, form.profilePhotoUrl]);

  useEffect(() => {
    const hostel = form.assignedHostel.trim();
    if (!hostel || hostel === 'All Hostels' || hostel === 'Central Office') {
      setHostelStudentCount(null);
      return;
    }
    let cancelled = false;
    void fetchStudentDirectoryList({ page: 1, limit: 1, hostel }).then((result) => {
      if (!cancelled) {
        setHostelStudentCount(result.total ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [form.assignedHostel]);

  const patch = useCallback((partial: Partial<StaffRegistrationForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STAFF_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as DraftPayload;
      if (draft?.form) {
        setForm({
          ...createEmptyStaffForm(),
          ...draft.form,
          employeeId: draft.form.employeeId || generateEmployeeId(),
        });
        if (draft.step >= 1 && draft.step <= 7) setStep(draft.step);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (form.jobTitle && !form.systemRole) {
      patch({ systemRole: suggestedSystemRole(form.jobTitle) });
    }
  }, [form.jobTitle, form.systemRole, patch]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-staff-reg]'), {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  useGSAP(
    () => {
      if (reduceMotion || !stepPanelRef.current) return;
      gsap.from(stepPanelRef.current.querySelectorAll('[data-staff-field]'), {
        opacity: 0,
        y: 10,
        duration: 0.3,
        stagger: 0.04,
        ease: 'power1.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: stepPanelRef, dependencies: [step, reduceMotion] },
  );

  const runStepValidation = (targetStep: number) => {
    const stepErrors = validateStaffStep(targetStep, form);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (!runStepValidation(step)) {
      errorSummaryRef.current?.focus();
      return;
    }
    setErrors({});
    setStep((s) => Math.min(STAFF_REGISTRATION_STEPS.length, s + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const goToStep = (target: number) => {
    if (target === step) return;
    setErrors({});
    setStep(target);
  };

  const saveDraft = () => {
    const payload: DraftPayload = { form, step, savedAt: new Date().toISOString() };
    localStorage.setItem(STAFF_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    toast.success('Draft saved on this device');
  };

  const handleCreate = async () => {
    const allErrors = validateAllStaffSteps(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const first = STAFF_REGISTRATION_STEPS.find((s) => Object.keys(validateStaffStep(s.id, form)).length > 0);
      if (first) setStep(first.id);
      errorSummaryRef.current?.focus();
      return;
    }
    setSubmitting(true);
    const result = await registerStaff(form);
    setSubmitting(false);
    if (!result.ok) {
      toast.error('Could not register staff', { description: result.message });
      return;
    }
    localStorage.removeItem(STAFF_DRAFT_STORAGE_KEY);
    toast.success(
      form.sendInvitation ? 'Staff registered — invitation sent' : 'Staff profile created',
      {
        description: form.sendInvitation
          ? `${form.firstName} ${form.lastName} — ${form.loginEmail}`
          : `${form.firstName} ${form.lastName} (${form.employeeId})`,
      },
    );
    router.push('/admin/staff');
  };

  const upsertDocument = (kind: StaffDocumentUpload['kind'], upload: StaffDocumentUpload) => {
    setForm((prev) => {
      const rest = prev.documentUploads.filter((d) => d.kind !== kind);
      return { ...prev, documentUploads: [...rest, upload] };
    });
  };

  const onPhoto = async (file: File | undefined, field: 'profilePhotoName' | 'employeePhotoName') => {
    setFileError(null);
    if (!file) {
      if (field === 'profilePhotoName') {
        patch({ profilePhotoName: '', profilePhotoObjectKey: '', profilePhotoUrl: '' });
      } else {
        patch({ employeePhotoName: '' });
        setForm((prev) => ({
          ...prev,
          documentUploads: prev.documentUploads.filter((d) => d.kind !== 'EMPLOYEE_PHOTO'),
        }));
      }
      return;
    }
    const err = validatePhotoFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    if (field === 'profilePhotoName') {
      setPhotoUploading(true);
      const result = await uploadStaffProfilePhoto(file);
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
      return;
    }
    setDocUploading(true);
    const docResult = await uploadStaffDocument(file);
    setDocUploading(false);
    if (!docResult.upload) {
      setFileError(docResult.error ?? 'Photo upload failed.');
      return;
    }
    patch({ employeePhotoName: docResult.upload.fileName });
    upsertDocument('EMPLOYEE_PHOTO', {
      kind: 'EMPLOYEE_PHOTO',
      objectKey: docResult.upload.objectKey,
      fileName: docResult.upload.fileName,
      mimeType: docResult.upload.mimeType,
      fileSize: docResult.upload.sizeBytes,
    });
  };

  const onDoc = async (
    file: File | undefined,
    field: 'identityProofDocName' | 'qualificationDocName' | 'appointmentDocName',
    kind: StaffDocumentUpload['kind'],
  ) => {
    setFileError(null);
    if (!file) {
      patch({ [field]: '' });
      setForm((prev) => ({
        ...prev,
        documentUploads: prev.documentUploads.filter((d) => d.kind !== kind),
      }));
      return;
    }
    const err = validateDocumentFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    setDocUploading(true);
    const result = await uploadStaffDocument(file);
    setDocUploading(false);
    if (!result.upload) {
      setFileError(result.error ?? 'Document upload failed.');
      return;
    }
    patch({ [field]: result.upload.fileName });
    upsertDocument(kind, {
      kind,
      objectKey: result.upload.objectKey,
      fileName: result.upload.fileName,
      mimeType: result.upload.mimeType,
      fileSize: result.upload.sizeBytes,
    });
  };

  const errorEntries = Object.entries(errors);

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <header
        data-staff-reg
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[var(--nestora-forest)]" aria-hidden />
        <div className="flex flex-wrap items-start justify-between gap-4 pl-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
              Dashboard / Staff & Wardens / Add Staff
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--nestora-forest)]">Add New Staff</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an employee profile and assign hostel responsibilities.
            </p>
          </div>
          <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href="/admin/staff" />}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
        </div>
        <div className="mt-5 pl-3">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>
              Step <strong className="text-foreground">{step}</strong> of {STAFF_REGISTRATION_STEPS.length}
            </span>
            <span className="font-medium text-[var(--nestora-forest)]">{STAFF_REGISTRATION_STEPS[step - 1]?.title}</span>
          </div>
          <Progress value={progressPct} className="gap-0">
            <ProgressTrack className="h-1.5 rounded-full bg-[#e7e7dc]">
              <ProgressIndicator className="rounded-full bg-[linear-gradient(90deg,#6d9773,#3d5a45)]" />
            </ProgressTrack>
          </Progress>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr]">
        <nav data-staff-reg aria-label="Registration steps" className="space-y-2 lg:sticky lg:top-6 lg:self-start">
          {STAFF_REGISTRATION_STEPS.map((s) => {
            const Icon = STEP_ICONS[s.id - 1] ?? UserCog;
            const active = s.id === step;
            const done = stepComplete[s.id - 1] === true && s.id !== step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
                  focusRing,
                  active
                    ? 'border-[color-mix(in_oklch,var(--nestora-sage)_48%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--card))] ring-2 ring-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)]'
                    : 'border-[var(--nestora-sage-muted)]/80 bg-card hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg border text-xs font-bold',
                    active
                      ? 'border-[var(--nestora-forest)] bg-[var(--nestora-forest)] text-white'
                      : done
                        ? 'border-[#6d9773] bg-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--card))]'
                        : 'border-border text-muted-foreground',
                  )}
                >
                  {done && !active ? <Check className="size-4 text-[#6d9773]" aria-hidden /> : s.id}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{s.short}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{s.title}</span>
                </span>
                <Icon className="ml-auto size-4 text-muted-foreground" aria-hidden />
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-4">
          {errorEntries.length > 0 ? (
            <div ref={errorSummaryRef} role="alert" tabIndex={-1} className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <h2 className="text-sm font-semibold text-destructive">Please fix {errorEntries.length} field(s)</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive/90">
                {errorEntries.map(([key, msg]) => (
                  <li key={key}>
                    <a href={`#field-${key}`}>{msg}</a>
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
              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
              transition={{ duration: 0.28, ease: motionEase }}
              className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">
                {step}. {STAFF_REGISTRATION_STEPS[step - 1]?.title}
              </h2>

              {step === 1 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <UploadCard
                    label="Profile Photo"
                    hint="JPG or PNG · Max 2 MB"
                    fileName={form.profilePhotoName}
                    uploading={photoUploading}
                    storedHint={
                      form.profilePhotoObjectKey
                        ? 'Stored in Neon (nestora-staff-profiles)'
                        : undefined
                    }
                    previewUrl={profilePhotoPreview}
                    onFile={(f) => void onPhoto(f, 'profilePhotoName')}
                    className="sm:col-span-2"
                  />
                  <FormField id="firstName" label="First Name" required error={errors.firstName} value={form.firstName} onChange={(v) => patch({ firstName: v })} />
                  <FormField id="lastName" label="Last Name" required error={errors.lastName} value={form.lastName} onChange={(v) => patch({ lastName: v })} />
                  <FormField id="dateOfBirth" label="Date of Birth" required type="date" error={errors.dateOfBirth} value={form.dateOfBirth} onChange={(v) => patch({ dateOfBirth: v })} />
                  <SelectField id="gender" label="Gender" required error={errors.gender} value={form.gender} onChange={(v) => patch({ gender: v })} options={GENDER_OPTIONS} />
                  <FormField id="email" label="Email Address" required type="email" error={errors.email} value={form.email} onChange={(v) => patch({ email: v })} />
                  <FormField id="phone" label="Phone Number" required error={errors.phone} value={form.phone} onChange={(v) => patch({ phone: v })} />
                  <FormField id="emergencyPhone" label="Emergency Contact Number" required error={errors.emergencyPhone} value={form.emergencyPhone} onChange={(v) => patch({ emergencyPhone: v })} className="sm:col-span-2" />
                </div>
              )}

              {step === 2 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FieldBlock label="Employee ID" required error={errors.employeeId} className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      <Input id="field-employeeId" readOnly value={form.employeeId} className="h-10 max-w-xs rounded-xl bg-muted/50 font-mono" />
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => patch({ employeeId: generateEmployeeId() })}>
                        Regenerate
                      </Button>
                    </div>
                  </FieldBlock>
                  <SelectField
                    id="jobTitle"
                    label="Job Title"
                    required
                    error={errors.jobTitle}
                    value={form.jobTitle}
                    onChange={(v) => {
                      patch({
                        jobTitle: v,
                        systemRole: suggestedSystemRole(v),
                        wardenType: '',
                        assignedHostel: '',
                      });
                    }}
                    options={JOB_TITLE_OPTIONS}
                  />
                  <SelectField id="department" label="Department" required error={errors.department} value={form.department} onChange={(v) => patch({ department: v })} options={DEPARTMENT_OPTIONS} />
                  <SelectField id="employmentType" label="Employment Type" required error={errors.employmentType} value={form.employmentType} onChange={(v) => patch({ employmentType: v })} options={EMPLOYMENT_TYPE_OPTIONS} />
                  <FormField id="joiningDate" label="Joining Date" required type="date" error={errors.joiningDate} value={form.joiningDate} onChange={(v) => patch({ joiningDate: v })} />
                  <SelectField id="workShift" label="Work Shift" required error={errors.workShift} value={form.workShift} onChange={(v) => patch({ workShift: v })} options={WORK_SHIFT_OPTIONS} />
                  <FormField id="salary" label="Salary (optional)" type="number" value={form.salary} onChange={(v) => patch({ salary: v })} />
                  <SelectField
                    id="reportingManager"
                    label="Reporting Manager"
                    value={form.reportingManager}
                    onChange={(v) => patch({ reportingManager: v })}
                    options={managerOptions}
                    disabled={facetsLoading && managerOptions.length <= 1}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="mt-5 space-y-4">
                  {!form.jobTitle ? (
                    <p className="text-sm text-muted-foreground">Select a job title in Professional Information to configure assignment fields.</p>
                  ) : (
                    <>
                      {isHostelBasedRole(form.jobTitle) ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <SelectField
                            id="assignedHostel"
                            label="Assigned Hostel"
                            required
                            error={errors.assignedHostel}
                            value={form.assignedHostel}
                            onChange={(v) => patch({ assignedHostel: v, assignedBlock: '', assignedFloor: '' })}
                            options={hostelOptions}
                            disabled={facetsLoading && hostelOptions.length <= 2}
                          />
                          <SelectField
                            id="assignedBlock"
                            label="Assigned Block"
                            value={form.assignedBlock}
                            onChange={(v) => patch({ assignedBlock: v })}
                            options={blockOptions}
                            disabled={!form.assignedHostel}
                          />
                          <SelectField id="assignedFloor" label="Assigned Floor" value={form.assignedFloor} onChange={(v) => patch({ assignedFloor: v })} options={HOSTEL_FLOORS} />
                          <FormField id="dutyStartDate" label="Joining / Duty Start Date" required type="date" error={errors.dutyStartDate} value={form.dutyStartDate} onChange={(v) => patch({ dutyStartDate: v })} />
                          <FieldBlock label="Responsibility" className="sm:col-span-2">
                            <Textarea value={form.responsibility} onChange={(e) => patch({ responsibility: e.target.value })} rows={3} className="rounded-xl" placeholder="Operational duties, coverage areas…" />
                          </FieldBlock>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField id="dutyStartDate" label="Duty Start Date" required type="date" error={errors.dutyStartDate} value={form.dutyStartDate} onChange={(v) => patch({ dutyStartDate: v })} />
                          <FieldBlock label="Responsibility" className="sm:col-span-2">
                            <Textarea value={form.responsibility} onChange={(e) => patch({ responsibility: e.target.value })} rows={2} className="rounded-xl" />
                          </FieldBlock>
                        </div>
                      )}

                      {isWardenRole(form.jobTitle) ? (
                        <div className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))] bg-card/90 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--nestora-sage)]">Warden fields</p>
                          <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            <SelectField id="wardenType" label="Warden Type" required error={errors.wardenType} value={form.wardenType} onChange={(v) => patch({ wardenType: v })} options={WARDEN_TYPE_OPTIONS} />
                            <FormField id="managedCapacity" label="Managed Capacity (optional)" type="number" value={form.managedCapacity} onChange={(v) => patch({ managedCapacity: v })} />
                            <div className="sm:col-span-2 rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-muted/20 px-3 py-2">
                              <p className="text-[10px] font-bold uppercase text-muted-foreground">Students at hostel</p>
                              <p className="text-lg font-semibold tabular-nums text-[var(--nestora-forest)]">
                                {hostelStudentCount == null
                                  ? form.assignedHostel
                                    ? '…'
                                    : '—'
                                  : hostelStudentCount.toLocaleString('en-IN')}
                              </p>
                              <p className="text-xs text-muted-foreground">Live count from student directory API.</p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {isSecurityRole(form.jobTitle) ? (
                        <div className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))] p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Security assignment</p>
                          <FormField
                            id="securityZone"
                            label="Patrol zone / gate assignment"
                            value={form.securityZone}
                            onChange={(v) => patch({ securityZone: v })}
                            className="mt-2"
                          />
                          <p className="mt-1 text-xs text-muted-foreground">Shift: {form.workShift || 'Set in Professional step'}.</p>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FieldBlock label="House / Street Address" required error={errors.fullAddress} className="sm:col-span-2">
                    <Textarea id="field-fullAddress" value={form.fullAddress} onChange={(e) => patch({ fullAddress: e.target.value })} rows={3} className="rounded-xl" />
                  </FieldBlock>
                  <FormField id="city" label="City" required error={errors.city} value={form.city} onChange={(v) => patch({ city: v })} />
                  <FormField id="state" label="State" required error={errors.state} value={form.state} onChange={(v) => patch({ state: v })} />
                  <FormField id="pinCode" label="PIN Code" required inputMode="numeric" error={errors.pinCode} value={form.pinCode} onChange={(v) => patch({ pinCode: v })} />
                  <SelectField id="country" label="Country" required error={errors.country} value={form.country} onChange={(v) => patch({ country: v })} options={COUNTRY_OPTIONS} />
                </div>
              )}

              {step === 5 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FormField id="emergencyContactName" label="Emergency Contact Name" required error={errors.emergencyContactName} value={form.emergencyContactName} onChange={(v) => patch({ emergencyContactName: v })} />
                  <SelectField id="emergencyRelationship" label="Relationship" required error={errors.emergencyRelationship} value={form.emergencyRelationship} onChange={(v) => patch({ emergencyRelationship: v })} options={RELATIONSHIP_OPTIONS} />
                  <FormField id="emergencyContactPhone" label="Emergency Phone" required error={errors.emergencyContactPhone} value={form.emergencyContactPhone} onChange={(v) => patch({ emergencyContactPhone: v })} />
                  <FormField id="alternateContact" label="Alternate Contact" value={form.alternateContact} onChange={(v) => patch({ alternateContact: v })} />
                </div>
              )}

              {step === 6 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <SelectField id="identityProofType" label="Identity Proof Type" required error={errors.identityProofType} value={form.identityProofType} onChange={(v) => patch({ identityProofType: v })} options={IDENTITY_PROOF_OPTIONS} />
                  <FormField id="identityProofNumber" label="Identity Proof Number" required error={errors.identityProofNumber} value={form.identityProofNumber} onChange={(v) => patch({ identityProofNumber: v })} />
                  <UploadCard
                    label="Identity Proof Document"
                    hint="JPG, PNG, or PDF · Max 5 MB"
                    required
                    fileName={form.identityProofDocName}
                    uploading={docUploading}
                    storedHint={form.documentUploads.some((d) => d.kind === 'IDENTITY_PROOF') ? 'Saved to nestora-staff-documents' : undefined}
                    onFile={(f) => void onDoc(f, 'identityProofDocName', 'IDENTITY_PROOF')}
                    className="sm:col-span-2"
                  />
                  <UploadCard label="Employee Photograph" fileName={form.employeePhotoName} onFile={(f) => onPhoto(f, 'employeePhotoName')} />
                  <UploadCard
                    label="Qualification Certificate"
                    fileName={form.qualificationDocName}
                    onFile={(f) => onDoc(f, 'qualificationDocName', 'QUALIFICATION')}
                  />
                  <UploadCard
                    label="Appointment Letter"
                    fileName={form.appointmentDocName}
                    onFile={(f) => onDoc(f, 'appointmentDocName', 'APPOINTMENT')}
                    className="sm:col-span-2"
                  />
                </div>
              )}

              {step === 7 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FormField id="loginEmail" label="Login Email" required type="email" error={errors.loginEmail} value={form.loginEmail} onChange={(v) => patch({ loginEmail: v })} />
                  <SelectField id="systemRole" label="Assigned Role (system access)" required error={errors.systemRole} value={form.systemRole} onChange={(v) => patch({ systemRole: v })} options={SYSTEM_ROLE_OPTIONS} />
                  <SelectField id="accountStatus" label="Account Status" required error={errors.accountStatus} value={form.accountStatus} onChange={(v) => patch({ accountStatus: v })} options={ACCOUNT_STATUS_OPTIONS} />
                  <label className="flex items-center gap-2 sm:col-span-2">
                    <Checkbox checked={form.sendInvitation} onCheckedChange={(v) => patch({ sendInvitation: v === true })} />
                    <span className="text-sm">Send account invitation by email</span>
                  </label>
                  <div
                    className={cn(
                      'flex gap-2 rounded-xl border px-3 py-3 text-sm sm:col-span-2',
                      form.systemRole === 'Admin'
                        ? 'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))]'
                        : 'border-[var(--nestora-sage-muted)] bg-card/80',
                    )}
                  >
                    <AlertTriangle className="size-4 shrink-0 text-[var(--nestora-gold)]" aria-hidden />
                    <p>
                      Role-based access only: do not grant <strong>Admin</strong> unless this employee truly needs full
                      console permissions. Warden and Staff roles limit access to assigned responsibilities.
                    </p>
                  </div>
                  <p className="sm:col-span-2 text-xs text-muted-foreground">
                    Passwords are never stored here — invitations use a secure setup link.
                  </p>
                </div>
              )}
            </motion.section>
          </AnimatePresence>

          <footer data-staff-reg className="flex flex-col gap-3 rounded-2xl border border-[var(--nestora-sage-muted)]/80 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-muted-foreground" role="note">
              Registration submits to Nestora API · photos &amp; documents upload to Neon staff buckets before create.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href="/admin/staff" />}>
                Cancel
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={saveDraft}>
                <Save className="size-4" aria-hidden />
                Save Draft
              </Button>
              {step > 1 ? (
                <Button type="button" variant="outline" className="rounded-xl" onClick={goBack}>
                  Back
                </Button>
              ) : null}
              {step < STAFF_REGISTRATION_STEPS.length ? (
                <Button type="button" className="rounded-xl bg-[var(--nestora-forest)]" onClick={goNext}>
                  Continue
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={submitting || photoUploading || docUploading}
                  className="rounded-xl bg-[var(--nestora-forest)]"
                  onClick={handleCreate}
                >
                  <UserPlus className="size-4" aria-hidden />
                  {submitting ? 'Creating…' : photoUploading || docUploading ? 'Uploading…' : 'Create Employee'}
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
    <div data-staff-field className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
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
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
}) {
  return (
    <FieldBlock label={label} required={required} error={error} className={className}>
      <Input
        id={`field-${id}`}
        data-staff-field
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-10 rounded-xl border-[var(--nestora-sage-muted)]', error && 'border-destructive')}
        aria-invalid={Boolean(error)}
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
  disabled,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <FieldBlock label={label} required={required} error={error} className={className}>
      <select
        id={`field-${id}`}
        data-staff-field
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
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldBlock>
  );
}

function UploadCard({
  label,
  hint,
  required,
  fileName,
  onFile,
  className,
  uploading = false,
  previewUrl,
  storedHint,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  fileName: string;
  onFile: (file: File | undefined) => void;
  className?: string;
  uploading?: boolean;
  previewUrl?: string | null;
  storedHint?: string;
}) {
  return (
    <FieldBlock label={label} required={required} className={className}>
      <div className="rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-card/90 p-4">
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        <label
          className={cn(
            'mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted/30',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          <FileUp className="size-4" aria-hidden />
          {uploading ? 'Uploading…' : 'Upload'}
          <input
            type="file"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => onFile(e.target.files?.[0])}
            accept={hint?.includes('PDF') ? 'image/jpeg,image/png,application/pdf' : 'image/jpeg,image/png'}
          />
        </label>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="mt-3 size-20 rounded-xl border border-[var(--nestora-sage-muted)] object-cover" />
        ) : null}
        {fileName ? <p className="mt-2 text-xs text-muted-foreground">Selected: {fileName}</p> : null}
        {storedHint ? <p className="mt-1 text-xs font-medium text-[var(--nestora-forest)]">{storedHint}</p> : null}
      </div>
    </FieldBlock>
  );
}
