'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Camera,
  CheckCircle2,
  Clock,
  GraduationCap,
  Home,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Phone,
  Shield,
  Upload,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

import { mapStudentProfileDesk } from '@/components/dashboard/student-portal/profile/student-profile-mapper';
import type { StudentSelfProfile, VerificationStatus } from '@/components/dashboard/student-portal/profile/student-profile-data';
import {
  StudentProfileField,
  StudentProfileSection,
} from '@/components/dashboard/student-portal/profile/student-profile-section';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudentProfileDesk } from '@/hooks/use-student-profile-desk';
import { getApiBaseUrl } from '@/lib/api/client';
import { patchStudentProfileDesk } from '@/lib/api/student-profile';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { uploadStudentProfilePhoto } from '@/lib/api/uploads';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function resolvePhotoUrl(url: string | null): string | null {
  if (!url) return null;
  const base = getApiBaseUrl();
  if (!base) return url;
  try {
    return `${base.replace(/\/$/, '')}${new URL(url).pathname}`;
  } catch {
    return url;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'ST';
}

const docStatusClass: Record<VerificationStatus, string> = {
  verified:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
  pending:
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
};

export function StudentProfilePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { initials: shellInitials } = useStudentShell();
  const { desk, loading, error, refresh, mergeDesk } = useStudentProfileDesk({ pollIntervalMs: 20_000 });

  const baseProfile = useMemo(
    () => (desk ? mapStudentProfileDesk(desk) : null),
    [desk],
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [personalDraft, setPersonalDraft] = useState<StudentSelfProfile['personal'] | null>(null);
  const [emergencyDraft, setEmergencyDraft] = useState<StudentSelfProfile['emergency'] | null>(null);

  useEffect(() => {
    if (!baseProfile || editing) return;
    setPersonalDraft(baseProfile.personal);
    setEmergencyDraft(baseProfile.emergency);
    setPhotoUrl(resolvePhotoUrl(baseProfile.photoUrl));
  }, [baseProfile, editing]);

  const profile = useMemo((): StudentSelfProfile | null => {
    if (!baseProfile || !personalDraft || !emergencyDraft) return null;
    return {
      ...baseProfile,
      photoUrl,
      personal: personalDraft,
      emergency: emergencyDraft,
    };
  }, [baseProfile, photoUrl, personalDraft, emergencyDraft]);

  const liveLabel = desk?.generatedAt ? formatRelativeTimeFromIso(desk.generatedAt) : null;
  const avatarInitials = shellInitials || getInitials(profile?.fullName ?? 'Student');

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-profile-block]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  const onPhotoPick = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Please choose an image file.');
        return;
      }
      setUploading(true);
      const preview = URL.createObjectURL(file);
      setPhotoUrl(preview);
      const result = await uploadStudentProfilePhoto(file);
      if (result.error) {
        toast.error(result.error);
        setPhotoUrl(resolvePhotoUrl(baseProfile?.photoUrl ?? null));
        URL.revokeObjectURL(preview);
        setUploading(false);
        return;
      }
      if (result.upload?.objectKey) {
        const patched = await patchStudentProfileDesk({
          profilePhotoObjectKey: result.upload.objectKey,
        });
        if (patched.desk) {
          mergeDesk(patched.desk);
          toast.success('Profile photo updated.');
        } else if (patched.error) {
          toast.error(patched.error);
        }
      }
      URL.revokeObjectURL(preview);
      setUploading(false);
    },
    [baseProfile?.photoUrl, mergeDesk],
  );

  const saveEditable = async () => {
    if (!personalDraft || !emergencyDraft) return;
    setSaving(true);
    const patched = await patchStudentProfileDesk({
      phone: personalDraft.phone,
      permanentAddress: personalDraft.permanentAddress,
      guardianName: emergencyDraft.guardianName,
      guardianPhone: emergencyDraft.primaryPhone,
      guardianRelation: emergencyDraft.relationship,
    });
    setSaving(false);
    if (patched.error) {
      toast.error(patched.error);
      return;
    }
    if (patched.desk) mergeDesk(patched.desk);
    setEditing(false);
    toast.success('Contact details saved. Academic and hostel records remain read-only.');
  };

  const cancelEdit = () => {
    if (baseProfile) {
      setPersonalDraft(baseProfile.personal);
      setEmergencyDraft(baseProfile.emergency);
    }
    setEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        Loading profile…
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!profile || !personalDraft || !emergencyDraft) return null;

  return (
    <div ref={rootRef} className="space-y-6 pb-4">
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <span>{error}</span>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      ) : null}
      {liveLabel ? (
        <p className="text-xs text-muted-foreground">Profile synced {liveLabel} · ~20s refresh</p>
      ) : null}
      <motion.header
        data-student-profile-block
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: motionEase }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))]',
          'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_50%,var(--card))_0%,var(--card)_60%)] p-6 shadow-sm sm:p-8',
        )}
      >
        <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-[color-mix(in_oklch,var(--nestora-gold)_15%,transparent)] blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0 self-start">
            <div
              className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[color-mix(in_oklch,var(--nestora-gold)_45%,var(--border))] bg-[var(--nestora-forest)] text-2xl font-bold text-white shadow-md sm:size-28"
              role="img"
              aria-label={`Profile photo of ${profile.fullName}`}
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="size-full object-cover" />
              ) : (
                avatarInitials
              )}
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className={cn(
                'absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full border border-border bg-card text-[var(--nestora-forest)] shadow-sm transition hover:bg-muted',
                focusRing,
              )}
              aria-label="Change profile photo"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Camera className="size-4" aria-hidden />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void onPhotoPick(e)}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <motion.div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[1.65rem]">
                {profile.fullName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.studentId} · {profile.course} · {profile.department}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.semester} · {profile.academicYear}
              </p>
            </motion.div>
            <form action={undefined} onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-center gap-2">
              <Badge className="border-0 bg-[var(--nestora-forest)] font-semibold text-white hover:bg-[var(--nestora-forest)]">
                {profile.accountStatus}
              </Badge>
              <Badge variant="outline" className="font-medium text-[var(--nestora-forest)]">
                <GraduationCap className="mr-1 size-3.5" aria-hidden />
                {profile.course}
              </Badge>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-none border border-[var(--nestora-forest)] bg-transparent px-3 text-xs font-semibold text-[var(--nestora-forest)] transition hover:bg-[color-mix(in_oklch,var(--nestora-forest)_8%,var(--card))]',
                    focusRing,
                  )}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveEditable()}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 bg-[var(--nestora-forest)] px-3 text-xs font-semibold text-white',
                      focusRing,
                    )}
                  >
                    {saving ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className={cn('inline-flex h-8 items-center px-3 text-xs font-medium text-muted-foreground hover:text-foreground', focusRing)}
                  >
                    Cancel
                  </button>
                </>
              )}
            </form>
            <p className="text-xs text-muted-foreground">
              Student ID, academic records, and hostel allocation are read-only. Edits to verified documents require approval.
            </p>
          </div>
        </div>
      </motion.header>

      <motion.div className="grid gap-6 lg:grid-cols-2">
        <StudentProfileSection
          id="student-personal-heading"
          title="Personal Information"
          action={
            profile.personal.verified ? (
              <Badge variant="outline" className="gap-1 font-semibold text-[var(--nestora-forest)]">
                <CheckCircle2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                Verified
              </Badge>
            ) : null
          }
        >
          <dl className="grid gap-0 sm:grid-cols-2 sm:gap-x-6">
            <StudentProfileField label="Full Name" value={personalDraft.fullName} />
            <StudentProfileField label="Gender" value={personalDraft.gender} />
            <StudentProfileField label="Date of Birth" value={personalDraft.dateOfBirth} />
            <StudentProfileField label="Blood Group" value={personalDraft.bloodGroup} />
            {editing ? (
              <>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground" htmlFor="student-phone">
                    Phone Number
                  </label>
                  <input
                    id="student-phone"
                    type="tel"
                    value={personalDraft.phone}
                    onChange={(e) =>
                      setPersonalDraft((p) => (p ? { ...p, phone: e.target.value } : p))
                    }
                    className={cn('mt-1 w-full border border-border bg-background px-3 py-2 text-sm', focusRing)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <StudentProfileField label="Email Address" value={personalDraft.email} />
                </div>
                <motion.div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground" htmlFor="student-address">
                    Permanent Address
                  </label>
                  <textarea
                    id="student-address"
                    rows={2}
                    value={personalDraft.permanentAddress}
                    onChange={(e) =>
                      setPersonalDraft((p) => (p ? { ...p, permanentAddress: e.target.value } : p))
                    }
                    className={cn('mt-1 w-full resize-y border border-border bg-background px-3 py-2 text-sm', focusRing)}
                  />
                </motion.div>
              </>
            ) : (
              <>
                <StudentProfileField label="Phone Number" value={personalDraft.phone} readOnly={false} />
                <StudentProfileField label="Email Address" value={personalDraft.email} readOnly={false} />
                <div className="sm:col-span-2">
                  <StudentProfileField label="Permanent Address" value={personalDraft.permanentAddress} readOnly={false} />
                </div>
              </>
            )}
          </dl>
        </StudentProfileSection>

        <StudentProfileSection id="student-academic-heading" title="Academic Information" description="Academic Details">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Official records — contact admin to request corrections
          </div>
          <dl className="grid gap-0 sm:grid-cols-2 sm:gap-x-6">
            <StudentProfileField label="Student ID" value={profile.academic.studentId} />
            <StudentProfileField label="Department" value={profile.academic.department} />
            <StudentProfileField label="Course" value={profile.academic.course} />
            <StudentProfileField label="Current Semester" value={profile.academic.semester} />
            <StudentProfileField label="Admission Year" value={profile.academic.admissionYear} />
          </dl>
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/25 p-3 text-sm">
            <span className="font-semibold text-muted-foreground">Academic Status</span>
            <Badge variant="outline" className="ml-auto font-semibold text-[var(--nestora-forest)]">
              {profile.academic.status}
            </Badge>
          </p>
        </StudentProfileSection>
      </motion.div>

      <motion.div className="grid gap-6 lg:grid-cols-2">
        <StudentProfileSection
          id="student-hostel-heading"
          title="Hostel Information"
          description="Hostel Allocation"
          action={
            profile.hostel.allocated ? (
              <Badge className="bg-[var(--nestora-sage)] font-semibold text-[var(--nestora-forest)] hover:bg-[var(--nestora-sage)]">
                Allocated
              </Badge>
            ) : null
          }
        >
          <motion.div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Home className="size-3.5" aria-hidden />
            <Lock className="size-3.5" aria-hidden />
            Allocation managed by hostel admin
          </motion.div>
          <dl className="grid gap-0 sm:grid-cols-2 sm:gap-x-6">
            <div className="sm:col-span-2">
              <StudentProfileField label="Hostel Name" value={profile.hostel.hostelName} />
            </div>
            <StudentProfileField label="Block" value={profile.hostel.block} />
            <StudentProfileField label="Room Number" value={profile.hostel.roomNumber} />
            <StudentProfileField label="Bed Number" value={profile.hostel.bedNumber} />
            <StudentProfileField label="Room Type" value={profile.hostel.roomType} />
            <StudentProfileField label="Allocation Date" value={profile.hostel.allocationDate} />
          </dl>
        </StudentProfileSection>

        <StudentProfileSection id="student-emergency-heading" title="Emergency Contact">
          <Users className="mb-2 size-4 text-[var(--nestora-sage)]" aria-hidden />
          {editing ? (
            <div className="space-y-3">
              {(
                [
                  ['guardianName', 'Guardian / Parent Name'],
                  ['relationship', 'Relationship'],
                  ['primaryPhone', 'Primary Contact Number'],
                  ['alternatePhone', 'Alternative Contact Number'],
                  ['address', 'Guardian Address'],
                ] as const
              ).map(([key, label]) => (
                <motion.div key={key}>
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`emergency-${key}`}>
                    {label}
                  </label>
                  {key === 'address' ? (
                    <textarea
                      id={`emergency-${key}`}
                      rows={2}
                      value={emergencyDraft.address}
                      onChange={(e) =>
                        setEmergencyDraft((d) => (d ? { ...d, address: e.target.value } : d))
                      }
                      className={cn('mt-1 w-full border border-border bg-background px-3 py-2 text-sm', focusRing)}
                    />
                  ) : (
                    <input
                      id={`emergency-${key}`}
                      type="text"
                      value={emergencyDraft[key]}
                      onChange={(e) =>
                        setEmergencyDraft((d) => (d ? { ...d, [key]: e.target.value } : d))
                      }
                      className={cn('mt-1 w-full border border-border bg-background px-3 py-2 text-sm', focusRing)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <dl>
              <StudentProfileField label="Guardian / Parent Name" value={emergencyDraft.guardianName} readOnly={false} />
              <StudentProfileField label="Relationship" value={emergencyDraft.relationship} readOnly={false} />
              <StudentProfileField label="Primary Contact Number" value={emergencyDraft.primaryPhone} readOnly={false} />
              <StudentProfileField label="Alternative Contact Number" value={emergencyDraft.alternatePhone} readOnly={false} />
              <StudentProfileField label="Guardian Address" value={emergencyDraft.address} readOnly={false} />
            </dl>
          )}
        </StudentProfileSection>
      </motion.div>

      <StudentProfileSection
        id="student-documents-heading"
        title="Documents & Verification"
        description="Uploaded documents and verification status"
        action={
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Upload className="size-3.5" aria-hidden />
            Re-uploads need approval
          </span>
        }
      >
        <form action={undefined} onSubmit={(e) => e.preventDefault()} className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={cn('capitalize', docStatusClass[doc.status])}>
                      {doc.status === 'verified' ? (
                        <CheckCircle2 className="mr-1 size-3" aria-hidden />
                      ) : (
                        <Clock className="mr-1 size-3" aria-hidden />
                      )}
                      {doc.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </form>
      </StudentProfileSection>

      <StudentProfileSection id="student-security-heading" title="Account & Security">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <dt className="text-xs font-semibold text-muted-foreground">Registered Email</dt>
            <dd className="mt-1 text-sm font-medium">{profile.security.email}</dd>
          </div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-xs font-semibold text-muted-foreground">Registered Mobile</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <Phone className="size-3.5 text-muted-foreground" aria-hidden />
              {profile.security.mobile}
            </dd>
          </div>
          <motion.div className="rounded-xl border border-border p-4">
            <dt className="text-xs font-semibold text-muted-foreground">Last Login</dt>
            <dd className="mt-1 text-sm font-medium">{profile.security.lastLogin}</dd>
          </motion.div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-xs font-semibold text-muted-foreground">Two-factor Authentication</dt>
            <dd className="mt-1">
              <Badge variant="outline" className="font-semibold">
                <Shield className="mr-1 size-3" aria-hidden />
                {profile.security.mfaEnabled ? 'Enabled' : 'Not enabled'}
              </Badge>
            </dd>
          </div>
          <motion.div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-muted/15 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Active Sessions</p>
              <p className="text-xs text-muted-foreground">{profile.security.activeSessions} devices signed in</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/student/settings"
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 border border-border bg-card px-3 text-xs font-semibold transition hover:bg-muted',
                  focusRing,
                )}
              >
                <KeyRound className="size-3.5" aria-hidden />
                Change Password
              </Link>
              <Link
                href="/student/settings"
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 bg-[var(--nestora-forest)] px-3 text-xs font-semibold text-white',
                  focusRing,
                )}
              >
                <User className="size-3.5" aria-hidden />
                Security Settings
              </Link>
            </div>
          </motion.div>
        </dl>
      </StudentProfileSection>
    </div>
  );
}
