'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Calendar,
  ClipboardCheck,
  DoorOpen,
  GraduationCap,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  formatJoinedDate,
  getStudentInitials,
  type StudentStatus,
} from '@/components/dashboard/students/admin-students-data';
import { getWardenHostelDisplayName } from '@/components/dashboard/warden/students/warden-students-hostel';
import { WardenStudentVerificationPanel } from '@/components/dashboard/warden/students/warden-student-verification-panel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { recordWardenCheckIn } from '@/lib/api/checkin-out';
import { type AdminStudentProfile, fetchAdminStudentProfile } from '@/lib/api/students';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const statusStyles: Record<StudentStatus, string> = {
  Active:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)]',
  Pending:
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)]',
  Inactive: 'border-border bg-muted/60 text-muted-foreground',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--nestora-sage-muted)]/50 py-2.5 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

type Props = { userId: string };

export function WardenStudentDetailPage({ userId }: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN');
  const hostelName = getWardenHostelDisplayName(
    selectedHostelId,
    overview?.scope.hostelNames ?? [],
    assignedHostels,
  );

  const [profile, setProfile] = useState<AdminStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminStudentProfile(userId);
    if (result.profile) setProfile(result.profile);
    else setError(result.error ?? 'Unable to load student profile.');
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayName = profile
    ? `${profile.account.firstName} ${profile.account.lastName}`.trim()
    : 'Student';
  const registration = profile?.student?.registrationNumber ?? '—';
  const initials = useMemo(() => getStudentInitials(displayName), [displayName]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current || !profile) return;
      gsap.from(rootRef.current.querySelectorAll('[data-warden-profile]'), {
        opacity: 0,
        y: 12,
        duration: 0.38,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, profile?.userId] },
  );

  if (loading && !profile) {
    return (
      <p className="inline-flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading resident profile…
      </p>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4 py-10">
        <Link
          href="/warden/students"
          className={cn('inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nestora-forest)]', focusRing)}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to students
        </Link>
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error ?? 'Student not found.'}
        </p>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  const housing = profile.housing;
  const student = profile.student;
  const admission = profile.admission;
  const tier2Pending = admission?.tier2Pending ?? false;

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/warden/students" className={cn('font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
          Students
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">{registration}</span>
      </nav>

      <header
        data-warden-profile
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,var(--nestora-sage),var(--nestora-forest))] text-lg font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">{hostelName}</p>
              <h1 className="mt-1 text-2xl font-semibold text-[var(--nestora-forest)]">{displayName}</h1>
              <p className="font-mono text-sm text-muted-foreground">{registration}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className={cn('rounded-full font-semibold', statusStyles[profile.directoryStatus])}>
                  {profile.directoryStatus}
                </Badge>
                {tier2Pending ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-[var(--nestora-gold)] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] font-semibold"
                  >
                    {admission?.statusLabel ?? 'Awaiting warden verification'}
                  </Badge>
                ) : admission?.fullyApproved ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-[var(--nestora-sage)] bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--card))] font-semibold"
                  >
                    Fully approved
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              className="rounded-xl"
              render={<Link href={`mailto:${profile.account.email}`} className={focusRing} />}
            >
              <Mail className="size-4" aria-hidden />
              Email
            </Button>
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              className="rounded-xl"
              render={<Link href="/warden/rooms" className={focusRing} />}
            >
              <BedDouble className="size-4" aria-hidden />
              Room desk
            </Button>
          </div>
        </div>
      </header>

      <div data-warden-profile>
        <WardenStudentVerificationPanel
          studentName={displayName}
          applicationId={admission?.applicationId ?? null}
          tier2Pending={tier2Pending}
          verificationHistory={admission?.verificationHistory ?? []}
          onUpdated={() => void load()}
        />
      </div>

      <motion.section
        className="grid gap-4 lg:grid-cols-12"
        aria-label="Resident overview"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: motionEase }}
      >
        <article
          data-warden-profile
          className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-forest)_12%,var(--border))] bg-[linear-gradient(165deg,color-mix(in_oklch,var(--nestora-forest)_96%,#0a3428)_0%,var(--nestora-forest)_100%)] text-white shadow-md lg:col-span-5"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
            <Building2 className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <h2 className="text-sm font-semibold">Room allocation</h2>
            <span className="ml-auto rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              {housing ? 'Allocated' : 'Unassigned'}
            </span>
          </div>
          <div className="space-y-3 p-4 sm:p-5">
            {housing ? (
              <>
                <p className="text-3xl font-semibold tracking-tight">{housing.roomNumber}</p>
                <p className="text-sm text-white/75">
                  Bed <span className="font-semibold text-white">{housing.bedNumber}</span> · {housing.hostelName}
                </p>
                <p className="text-xs text-white/60">Since {formatJoinedDate(housing.allocatedSince)}</p>
              </>
            ) : (
              <p className="text-sm text-white/80">No bed allocated yet. Assign after full admission approval (FR-013).</p>
            )}
          </div>
        </article>

        <article
          data-warden-profile
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Academics</h2>
          </div>
          {student ? (
            <dl>
              <InfoRow label="Course" value={student.course} />
              <InfoRow label="Department" value={student.department} />
              <InfoRow label="Year" value={student.academicYear} />
              <InfoRow label="Semester" value={student.currentSemester} />
              <InfoRow label="Gender" value={student.gender} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Academic profile not provisioned yet.</p>
          )}
        </article>

        <article
          data-warden-profile
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-tan)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-4 shadow-sm sm:p-5 lg:col-span-3"
        >
          <div className="mb-3 flex items-center gap-2">
            <User className="size-4 text-[var(--nestora-tan)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Contact</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Mail className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <a href={`mailto:${profile.account.email}`} className={cn('truncate hover:underline', focusRing)}>
                {profile.account.email}
              </a>
            </p>
            <p className="flex items-center gap-2 font-medium">
              <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              {profile.account.phone ?? '—'}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              Joined {formatJoinedDate(profile.account.joinedAt)}
            </p>
          </dl>
        </article>

        <article
          data-warden-profile
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Users className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Guardian</h2>
          </div>
          {student ? (
            <dl>
              <InfoRow label="Name" value={student.guardianName} />
              <InfoRow label="Relation" value={student.guardianRelation} />
              <InfoRow label="Phone" value={student.guardianPhone} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </article>

        <article
          data-warden-profile
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <HeartPulse className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Health &amp; address</h2>
          </div>
          {student ? (
            <dl>
              <InfoRow label="Date of birth" value={formatJoinedDate(student.dateOfBirth)} />
              <InfoRow label="Blood group" value={student.bloodGroup ?? '—'} />
              <InfoRow label="Medical alerts" value={student.medicalAlerts?.trim() || 'None noted'} />
              <div className="flex gap-2 pt-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <p className="text-sm leading-snug text-muted-foreground">{student.permanentAddress}</p>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </article>

        <article
          data-warden-profile
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_30%,var(--card))] p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Check-in readiness</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Formal check-in logging and key issuance follow full admission (FR-032, MOD-06).
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">Admission gate</span>
              <span className="font-semibold">{tier2Pending ? 'Pending tier-2' : 'Cleared for ops'}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">Bed assigned</span>
              <span className="font-semibold">{housing ? 'Yes' : 'No'}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">Formal check-in</span>
              <span className="font-semibold">
                {housing?.checkedIn ? 'Logged' : housing ? 'Pending' : 'N/A'}
              </span>
            </li>
          </ul>
          {housing && !housing.checkedIn ? (
            <Button
              type="button"
              size="sm"
              className="mt-3 rounded-xl bg-[var(--nestora-forest)]"
              onClick={() => {
                void recordWardenCheckIn({
                  allocationId: housing.allocationId,
                  keysIssued: true,
                }).then((result) => {
                  if (result.error) toast.error(result.error);
                  else {
                    toast.success('Check-in recorded with keys issued.');
                    void load();
                  }
                });
              }}
            >
              <ClipboardCheck className="size-4" aria-hidden />
              Record check-in
            </Button>
          ) : null}
        </article>
      </motion.section>

      <footer
        data-warden-profile
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--muted))] px-4 py-3"
      >
        <p className="text-xs text-muted-foreground">Quick links for this resident</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/warden/attendance"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-1.5 text-xs font-semibold text-[var(--nestora-forest)] hover:bg-muted/50',
              focusRing,
            )}
          >
            <ClipboardCheck className="size-3.5" aria-hidden />
            Attendance
          </Link>
          <Link
            href="/warden/leave"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-1.5 text-xs font-semibold text-[var(--nestora-forest)] hover:bg-muted/50',
              focusRing,
            )}
          >
            <DoorOpen className="size-3.5" aria-hidden />
            Leave
          </Link>
        </div>
      </footer>
    </div>
  );
}
