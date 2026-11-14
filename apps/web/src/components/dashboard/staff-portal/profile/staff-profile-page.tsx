'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Building2,
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

import { formatJoinedDate, getStudentInitials } from '@/components/dashboard/students/admin-students-data';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccountDesk } from '@/hooks/use-account-desk';
import { patchAccountDeskProfile } from '@/lib/api/account';
import { getApiBaseUrl } from '@/lib/api/client';
import { uploadStaffProfilePhoto } from '@/lib/api/uploads';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--nestora-sage-muted)]/50 py-2.5 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function StaffProfilePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { roleLabel } = useStaffShell();

  const { desk, loading, error, refresh, mergeProfile } = useAccountDesk({ pollIntervalMs: 20_000 });

  const profile = desk?.profile;
  const fullName = profile ? `${profile.account.firstName} ${profile.account.lastName}`.trim() : '';
  const initials = getStudentInitials(fullName || 'ST');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const liveLabel = desk?.generatedAt ? formatRelativeTimeFromIso(desk.generatedAt) : null;

  useEffect(() => {
    if (!profile || editing) return;
    setPhone(profile.account.phone ?? '');
    setEmergencyName(profile.staff?.emergencyContactName ?? '');
    setEmergencyRelation(profile.staff?.emergencyRelationship ?? '');
    setEmergencyPhone(profile.staff?.emergencyContactPhone ?? '');
    setPhotoUrl(resolvePhotoUrl(profile.profilePhotoUrl));
  }, [profile, editing]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-profile-block]'), {
        opacity: 0,
        y: 14,
        stagger: 0.05,
        duration: 0.4,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, profile?.userId] },
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
      const upload = await uploadStaffProfilePhoto(file);
      if (upload.error || !upload.upload) {
        setUploading(false);
        toast.error(upload.error ?? 'Upload failed.');
        return;
      }
      const result = await patchAccountDeskProfile({ profilePhotoObjectKey: upload.upload.objectKey });
      setUploading(false);
      if (result.error || !result.profile) {
        toast.error(result.error ?? 'Could not save photo.');
        return;
      }
      mergeProfile(result.profile);
      setPhotoUrl(resolvePhotoUrl(result.profile.profilePhotoUrl));
      toast.success('Profile photo updated.');
    },
    [mergeProfile],
  );

  const onSaveContact = async () => {
    setSaving(true);
    const result = await patchAccountDeskProfile({
      phone,
      emergencyContactName: emergencyName,
      emergencyRelationship: emergencyRelation,
      emergencyContactPhone: emergencyPhone,
    });
    setSaving(false);
    if (result.error || !result.profile) {
      toast.error(result.error ?? 'Could not save profile.');
      return;
    }
    mergeProfile(result.profile);
    setEditing(false);
    toast.success('Contact details saved.');
  };

  const hostels = useMemo(() => {
    if (!profile) return [];
    const names = new Set<string>();
    for (const a of profile.assignments ?? []) names.add(a.hostelName);
    if (profile.assignment?.hostelName) names.add(profile.assignment.hostelName);
    return [...names];
  }, [profile]);

  if (loading && !desk) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading your profile…</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" variant="outline" className="rounded-xl" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  const subtitle =
    profile.staff?.designation?.trim() || profile.account.systemRoleLabel || roleLabel;

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Account, employment record, and active sessions. Refreshes every 20 seconds.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('shrink-0 gap-2', focusRing)}
          disabled={loading}
          onClick={() => refresh()}
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          Refresh
        </Button>
      </header>

      <section
        data-profile-block
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_50%,var(--card))_0%,var(--card)_65%)] p-5 shadow-sm sm:p-6"
      >
        <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
          <User className="size-3.5" aria-hidden />
          Staff account
          {liveLabel ? (
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
              Synced {liveLabel}
            </span>
          ) : null}
        </p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative size-24 shrink-0">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="size-24 rounded-2xl border object-cover shadow-sm" />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-2xl border bg-[var(--nestora-forest)] text-2xl font-semibold text-white">
                {initials}
              </div>
            )}
            <button
              type="button"
              className={cn(
                'absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border bg-card shadow-md',
                focusRing,
              )}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile photo"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => void onPhotoPick(e)} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold text-[var(--nestora-forest)]">{fullName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full">
                {profile.directoryStatus}
              </Badge>
              {profile.account.isVerified ? (
                <Badge variant="outline" className="gap-1 rounded-full">
                  <CheckCircle2 className="size-3" aria-hidden />
                  Verified
                </Badge>
              ) : null}
              {profile.account.mfaEnabled ? (
                <Badge variant="outline" className="gap-1 rounded-full">
                  <Shield className="size-3" aria-hidden />
                  MFA on
                </Badge>
              ) : null}
            </div>
            {hostels.length ? (
              <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                {hostels.join(' · ')}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <motion.div
        data-profile-block
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Contact &amp; account</h2>
            {!editing ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn('rounded-lg', focusRing)}
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" aria-hidden />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-lg"
                  onClick={() => {
                    setEditing(false);
                    setPhone(profile.account.phone ?? '');
                    setEmergencyName(profile.staff?.emergencyContactName ?? '');
                    setEmergencyRelation(profile.staff?.emergencyRelationship ?? '');
                    setEmergencyPhone(profile.staff?.emergencyContactPhone ?? '');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className={cn('rounded-lg bg-[var(--nestora-forest)] text-white', focusRing)}
                  disabled={saving}
                  onClick={() => void onSaveContact()}
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            )}
          </div>
          <dl className="mt-4">
            <InfoRow label="Email" value={profile.account.email} />
            {editing ? (
              <label className="block border-b py-2.5 last:border-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Phone</span>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={cn('mt-1 h-10 rounded-xl', focusRing)}
                />
              </label>
            ) : (
              <InfoRow label="Phone" value={profile.account.phone?.trim() || '—'} />
            )}
            <InfoRow label="Member since" value={formatJoinedDate(profile.account.joinedAt)} />
          </dl>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Emergency contact</h2>
          {editing ? (
            <div className="mt-4 space-y-3">
              <Input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Contact name"
                className={cn('h-10 rounded-xl', focusRing)}
              />
              <Input
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                placeholder="Relationship"
                className={cn('h-10 rounded-xl', focusRing)}
              />
              <Input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Phone number"
                className={cn('h-10 rounded-xl', focusRing)}
              />
            </div>
          ) : (
            <dl className="mt-4">
              <InfoRow label="Name" value={profile.staff?.emergencyContactName?.trim() || '—'} />
              <InfoRow label="Relationship" value={profile.staff?.emergencyRelationship?.trim() || '—'} />
              <InfoRow label="Phone" value={profile.staff?.emergencyContactPhone?.trim() || '—'} />
            </dl>
          )}
        </section>
      </motion.div>

      {profile.staff ? (
        <section data-profile-block className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Employment record</h2>
          <dl className="mt-4 grid gap-0 sm:grid-cols-2 sm:gap-x-8">
            <InfoRow label="Employee ID" value={profile.staff.employeeNumber?.trim() || '—'} />
            <InfoRow label="Designation" value={profile.staff.designation} />
            <InfoRow label="Department" value={profile.staff.department} />
            <InfoRow label="Employment type" value={profile.staff.employmentType?.trim() || '—'} />
            <InfoRow label="Shift preference" value={profile.staff.shiftPreference?.trim() || '—'} />
            <InfoRow label="Joining date" value={profile.staff.joiningDate ?? '—'} />
          </dl>
        </section>
      ) : null}

      <section data-profile-block className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Security &amp; sessions</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              nativeButton={false}
              size="sm"
              variant="outline"
              className={cn('rounded-lg', focusRing)}
              render={<Link href="/staff/settings">Settings</Link>}
            />
            <Button
              nativeButton={false}
              size="sm"
              variant="outline"
              className={cn('rounded-lg', focusRing)}
              render={<Link href="/change-password">Change password</Link>}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          <Mail className="mr-1 inline size-3.5" aria-hidden />
          Signed in as {profile.account.email}
          {profile.account.mustChangePassword ? ' · password change required' : ''}
        </p>
        <ul className="mt-4 space-y-2">
          {(desk?.sessions ?? []).map((session) => (
            <li
              key={session.id}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-xs',
                session.isCurrent &&
                  'border-[var(--nestora-forest)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))]',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[var(--nestora-forest)]">
                  {session.isCurrent ? 'This device' : 'Active session'}
                </span>
                <span className="text-muted-foreground">
                  Last active {session.lastActivityAt ? formatRelativeTimeFromIso(session.lastActivityAt) : '—'}
                </span>
              </div>
              <p className="mt-1 truncate text-muted-foreground">{session.userAgent ?? 'Unknown browser'}</p>
              {session.ipAddress ? (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  <Phone className="mr-0.5 inline size-3" aria-hidden />
                  IP {session.ipAddress}
                </p>
              ) : null}
            </li>
          ))}
          {!desk?.sessions.length ? (
            <li className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No active sessions reported.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}