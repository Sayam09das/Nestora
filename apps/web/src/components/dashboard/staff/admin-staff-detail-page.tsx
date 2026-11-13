'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Download,
  FileText,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  formatJoinedDate,
  getStudentInitials,
} from '@/components/dashboard/students/admin-students-data';
import type { StaffStatus } from '@/components/dashboard/staff/admin-staff-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getApiBaseUrl } from '@/lib/api/client';
import { AdminStaffHostelAssignments } from '@/components/dashboard/staff/admin-staff-hostel-assignments';
import { type AdminStaffProfile, fetchAdminStaffProfile } from '@/lib/api/staff';
import { downloadStaffDocument } from '@/lib/api/uploads';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const statusStyles: Record<StaffStatus, string> = {
  Active:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
  'On Leave':
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
  Inactive: 'border-border bg-muted/60 text-muted-foreground',
};

const DOCUMENT_KIND_LABELS: Record<string, string> = {
  IDENTITY_PROOF: 'Identity proof',
  EMPLOYEE_PHOTO: 'Employee photograph',
  QUALIFICATION: 'Qualification certificate',
  APPOINTMENT: 'Appointment letter',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--nestora-sage-muted)]/50 py-2.5 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground break-words">{value}</dd>
    </div>
  );
}

type AdminStaffDetailPageProps = {
  userId: string;
};

function resolveStaffPhotoUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }
  const base = getApiBaseUrl();
  if (!base) {
    return url;
  }
  try {
    const parsed = new URL(url);
    return `${base.replace(/\/$/, '')}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export function AdminStaffDetailPage({ userId }: AdminStaffDetailPageProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<AdminStaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminStaffProfile(userId);
    if (result.profile) {
      setProfile(result.profile);
    } else {
      setError(result.error ?? 'Unable to load staff profile.');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      void fetchAdminStaffProfile(userId).then((result) => {
        if (result.profile) {
          setProfile(result.profile);
        }
      });
    }, 20_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load, userId]);

  const displayName = profile
    ? `${profile.account.firstName} ${profile.account.lastName}`.trim()
    : 'Staff member';
  const employeeId =
    profile?.staff?.employeeNumber ??
    (profile ? `STF-${profile.userId.slice(0, 8).toUpperCase()}` : '—');

  const initials = useMemo(() => getStudentInitials(displayName), [displayName]);

  const photoUrl = useMemo(
    () => resolveStaffPhotoUrl(profile?.profilePhotoUrl ?? null),
    [profile?.profilePhotoUrl],
  );

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUrl]);

  const onDownload = async (docId: string, objectKey: string, fileName: string) => {
    setDownloadingId(docId);
    const result = await downloadStaffDocument(objectKey, fileName);
    setDownloadingId(null);
    if (result.error) {
      toast.error('Download failed', { description: result.error });
      return;
    }
    toast.success('Download started', { description: fileName });
  };

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) {
        return;
      }
      gsap.from(rootRef.current.querySelectorAll('[data-staff-profile-bento]'), {
        opacity: 0,
        scale: 0.96,
        y: 18,
        duration: 0.42,
        stagger: { each: 0.07, from: 'start', grid: 'auto' },
        ease: 'back.out(1.25)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, profile?.userId] },
  );

  if (loading && !profile) {
    return (
      <p className="inline-flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading staff profile…
      </p>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4 py-10">
        <Link
          href="/admin/staff"
          className={cn('inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nestora-forest)]', focusRing)}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to directory
        </Link>
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error ?? 'Staff member not found.'}
        </p>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  const staff = profile.staff;
  const documents = staff?.documents ?? [];
  const assignmentNames = new Set<string>();
  for (const row of profile.wardenInCharge ?? []) {
    assignmentNames.add(row.hostelName);
  }
  for (const row of profile.assignments ?? []) {
    assignmentNames.add(row.hostelName);
  }
  const location =
    assignmentNames.size > 0
      ? [...assignmentNames].sort((a, b) => a.localeCompare(b)).join(' · ')
      : 'Central Office';

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/staff" className={cn('font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
          Staff &amp; Wardens
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">{employeeId}</span>
      </nav>

      <header
        data-staff-profile-bento
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-[0_20px_50px_-40px_color-mix(in_srgb,var(--nestora-forest)_35%,transparent)]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,color-mix(in_oklch,var(--nestora-sage)_18%,transparent),transparent_55%)]"
          aria-hidden
        />
        <div className="relative grid gap-6 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
          {photoUrl && !photoFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              width={96}
              height={96}
              className="size-20 rounded-2xl border-2 border-white/80 object-cover shadow-lg sm:size-24"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <motion.span
              className="flex size-20 items-center justify-center rounded-2xl border-2 border-white/80 bg-[linear-gradient(145deg,var(--nestora-sage),var(--nestora-forest))] text-2xl font-bold tracking-tight text-white shadow-lg sm:size-24"
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            >
              {initials}
            </motion.span>
          )}

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
              Personnel profile
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-3xl">
              {displayName}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{employeeId}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className={cn('rounded-full font-semibold', statusStyles[profile.directoryStatus])}>
                {profile.directoryStatus}
              </Badge>
              {profile.account.isVerified ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-[var(--nestora-sage-muted)] bg-card font-semibold text-[var(--nestora-forest)]"
                >
                  <ShieldCheck className="mr-1 size-3 text-[var(--nestora-sage)]" aria-hidden />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full font-semibold text-muted-foreground">
                  Activation pending
                </Badge>
              )}
            </div>
          </div>

          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link href={`mailto:${profile.account.email}`} className={focusRing} />}
            className="h-9 gap-1.5 rounded-xl border-[var(--nestora-sage-muted)] bg-card px-3 text-sm font-semibold text-[var(--nestora-forest)]"
          >
            <Mail className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            Email
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-12" aria-label="Staff overview">
        <article
          data-staff-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Briefcase className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Role &amp; department</h2>
          </div>
          {staff ? (
            <dl>
              <InfoRow label="Designation" value={staff.designation} />
              <InfoRow label="Department" value={staff.department} />
              <InfoRow label="Employment type" value={staff.employmentType ?? '—'} />
              <InfoRow label="Work shift" value={staff.shiftPreference ?? '—'} />
              <InfoRow
                label="Joining date"
                value={staff.joiningDate ? formatJoinedDate(staff.joiningDate) : '—'}
              />
              <InfoRow
                label="System role"
                value={profile.account.systemRoleLabel ?? profile.account.systemRole.replace(/_/g, ' ')}
              />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Staff profile record not provisioned yet.</p>
          )}
        </article>

        <article
          data-staff-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-forest)_12%,var(--border))] bg-[linear-gradient(165deg,color-mix(in_oklch,var(--nestora-forest)_96%,#0a3428)_0%,var(--nestora-forest)_100%)] p-4 text-white shadow-md sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <h2 className="text-sm font-semibold">Assignment</h2>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{location}</p>
          {(profile.assignments?.length ?? 0) > 0 ? (
            <p className="mt-2 text-xs text-white/60">
              {profile.assignments!.length} assigned hostel{profile.assignments!.length === 1 ? '' : 's'}
            </p>
          ) : (
            <p className="mt-2 text-sm text-white/75">No hostel assignment on file.</p>
          )}
        </article>

        <article
          data-staff-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-tan)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <UserCog className="size-4 text-[var(--nestora-tan)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Contact</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Mail className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <a href={`mailto:${profile.account.email}`} className={cn('break-all hover:underline', focusRing)}>
                {profile.account.email}
              </a>
            </p>
            <p className="flex items-center gap-2 font-medium">
              <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              {profile.account.phone ?? '—'}
            </p>
            <p className="text-muted-foreground">Joined {formatJoinedDate(profile.account.joinedAt)}</p>
          </dl>
        </article>
        <article
          data-staff-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Verification</h2>
          </div>
          {staff ? (
            <dl>
              <InfoRow label="Identity proof" value={staff.identityProofType ?? '—'} />
              <InfoRow label="ID number" value={staff.identityProofNumber ?? '—'} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </article>

        <article
          data-staff-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <Phone className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Emergency contact</h2>
          </div>
          {staff ? (
            <dl>
              <InfoRow label="Name" value={staff.emergencyContactName ?? '—'} />
              <InfoRow label="Relationship" value={staff.emergencyRelationship ?? '—'} />
              <InfoRow label="Phone" value={staff.emergencyContactPhone ?? '—'} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </article>

        <article
          data-staff-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-4 shadow-sm sm:p-5 lg:col-span-12"
        >
          <div className="mb-2 flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Permanent address</h2>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {staff?.permanentAddress?.trim() || 'No address on file for this employee.'}
          </p>
        </article>
      </section>

      {profile.account.systemRole === 'HOSTEL_WARDEN' || profile.account.systemRole === 'HOSTEL_STAFF' ? (
        <AdminStaffHostelAssignments userId={userId} profile={profile} onUpdated={setProfile} />
      ) : null}

      <article
        data-staff-profile-bento
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nestora-sage-muted)]/60 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Documents vault</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {documents.length === 0
              ? 'No files uploaded'
              : `${documents.length} file${documents.length === 1 ? '' : 's'} · Neon private bucket`}
          </p>
        </div>

        {documents.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
            No HR documents on record. Upload files when registering or updating this employee.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--nestora-sage-muted)]/50">
            {documents.map((doc) => {
              const label = DOCUMENT_KIND_LABELS[doc.kind] ?? doc.kind.replace(/_/g, ' ');
              const busy = downloadingId === doc.id;
              return (
                <li key={doc.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nestora-sage)]">{label}</p>
                    <p className="truncate text-sm font-semibold text-foreground">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(doc.fileSize)} · {doc.mimeType} · {formatJoinedDate(doc.uploadedAt.slice(0, 10))}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    className="h-9 gap-1.5 rounded-xl border-[var(--nestora-sage-muted)]"
                    onClick={() => void onDownload(doc.id, doc.objectKey, doc.fileName)}
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
                    {busy ? 'Downloading…' : 'Download'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </div>
  );
}
