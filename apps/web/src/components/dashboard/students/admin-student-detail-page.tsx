'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Calendar,
  GraduationCap,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { formatJoinedDate, getStudentInitials, type StudentStatus } from '@/components/dashboard/students/admin-students-data';
import { StudentDirectoryAvatar } from '@/components/dashboard/students/student-directory-avatar';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type AdminStudentProfile, fetchAdminStudentProfile } from '@/lib/api/students';
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

type AdminStudentDetailPageProps = {
  userId: string;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--nestora-sage-muted)]/50 py-2.5 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AdminStudentDetailPage({ userId }: AdminStudentDetailPageProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<AdminStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminStudentProfile(userId);
    if (result.profile) {
      setProfile(result.profile);
    } else {
      setError(result.error ?? 'Unable to load student profile.');
    }
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
      if (reduceMotion || !rootRef.current) {
        return;
      }
      gsap.from(rootRef.current.querySelectorAll('[data-profile-bento]'), {
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
        Loading student profile…
      </p>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4 py-10">
        <Link
          href="/admin/students"
          className={cn('inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nestora-forest)]', focusRing)}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to directory
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

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/students" className={cn('font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
          Students
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">{registration}</span>
      </nav>

      <header
        data-profile-bento
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-[0_20px_50px_-40px_color-mix(in_srgb,var(--nestora-forest)_35%,transparent)]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,color-mix(in_oklch,var(--nestora-sage)_18%,transparent),transparent_55%),radial-gradient(700px_circle_at_100%_0%,color-mix(in_oklch,var(--nestora-gold)_14%,transparent),transparent_50%)]"
          aria-hidden
        />
        <div className="relative grid gap-6 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
          <StudentDirectoryAvatar
            name={displayName}
            photoUrl={profile.account.profilePhotoUrl}
            size="lg"
            className="border-2 border-white/80 shadow-lg"
          />

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Resident profile</p>
            <motion.h1
              className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-3xl"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: motionEase }}
            >
              {displayName}
            </motion.h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{registration}</p>
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

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              render={<Link href={`mailto:${profile.account.email}`} className={focusRing} />}
              className="h-9 gap-1.5 rounded-xl border-[var(--nestora-sage-muted)] bg-card px-3 text-sm font-semibold text-[var(--nestora-forest)] hover:bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))]"
            >
              <Mail className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              Email
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/admin/allocation" className={focusRing} />}
              className="h-9 rounded-xl bg-[var(--nestora-forest)] px-3 text-sm font-semibold text-white"
            >
              <BedDouble className="size-4" aria-hidden />
              Allocation
            </Button>
          </div>
        </div>
      </header>

      <motion.p
        className="text-sm text-muted-foreground"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        This is what administrators see for this student account — housing, academics, and emergency contacts in one place.
      </motion.p>

      <motion.section
        className="grid gap-4 lg:grid-cols-12"
        aria-label="Student account overview"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: motionEase }}
      >
        <article
          data-profile-bento
          className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-forest)_12%,var(--border))] bg-[linear-gradient(165deg,color-mix(in_oklch,var(--nestora-forest)_96%,#0a3428)_0%,var(--nestora-forest)_100%)] text-white shadow-md lg:col-span-5"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
            <Building2 className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <h2 className="text-sm font-semibold">Housing</h2>
            {housing ? (
              <span className="ml-auto rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold">
                Allocated
              </span>
            ) : (
              <span className="ml-auto rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold">
                Unassigned
              </span>
            )}
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            {housing ? (
              <>
                <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{housing.roomNumber}</p>
                <p className="text-sm text-white/75">
                  Bed <span className="font-semibold text-white">{housing.bedNumber}</span> · {housing.hostelName}
                </p>
                <p className="text-xs text-white/60">Since {formatJoinedDate(housing.allocatedSince)}</p>
                <div className="flex h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,var(--nestora-sage),var(--nestora-gold))]" />
                </div>
              </>
            ) : (
              <p className="text-sm text-white/80">No active bed allocation. Assign from the allocation module.</p>
            )}
          </div>
        </article>

        <article
          data-profile-bento
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
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Student profile record not provisioned yet.</p>
          )}
        </article>

        <article
          data-profile-bento
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
          data-profile-bento
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
          data-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <HeartPulse className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Health & address</h2>
          </div>
          {student ? (
            <dl>
              <InfoRow label="Date of birth" value={formatJoinedDate(student.dateOfBirth)} />
              <InfoRow label="Blood group" value={student.bloodGroup ?? '—'} />
              <InfoRow label="Medical" value={student.medicalAlerts?.trim() || 'None noted'} />
              <div className="flex gap-2 pt-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <p className="text-sm text-muted-foreground leading-snug">{student.permanentAddress}</p>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </article>

        <article
          data-profile-bento
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_30%,var(--card))] p-4 shadow-sm sm:p-5 lg:col-span-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Account security</h2>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">System status</span>
              <span className="font-semibold text-foreground">{profile.account.userStatus}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">MFA</span>
              <span className="font-semibold text-foreground">{profile.account.mfaEnabled ? 'Enabled' : 'Off'}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">Password</span>
              <span className="font-semibold text-foreground">
                {profile.account.mustChangePassword ? 'Change required' : 'OK'}
              </span>
            </li>
          </ul>
        </article>
      </motion.section>

      <footer
        data-profile-bento
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--muted))] px-4 py-3"
      >
        <p className="text-xs text-muted-foreground">Quick links for day-to-day ops</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/attendance"
            className={cn(
              'rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-1.5 text-xs font-semibold text-[var(--nestora-forest)] hover:bg-muted/50',
              focusRing,
            )}
          >
            Attendance
          </Link>
          <Link
            href="/admin/leave"
            className={cn(
              'rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-1.5 text-xs font-semibold text-[var(--nestora-forest)] hover:bg-muted/50',
              focusRing,
            )}
          >
            Leave
          </Link>
          <Link
            href="/admin/fees"
            className={cn(
              'rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-1.5 text-xs font-semibold text-[var(--nestora-forest)] hover:bg-muted/50',
              focusRing,
            )}
          >
            Fees
          </Link>
        </div>
      </footer>
    </div>
  );
}
