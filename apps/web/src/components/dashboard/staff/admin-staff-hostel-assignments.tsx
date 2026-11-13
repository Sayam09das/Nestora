'use client';

import { Loader2, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { AdminStaffProfile } from '@/lib/api/staff';
import { fetchStaffDirectorySummary, updateStaffHostelAssignments } from '@/lib/api/staff';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  userId: string;
  profile: AdminStaffProfile;
  onUpdated: (profile: AdminStaffProfile) => void;
};

export function AdminStaffHostelAssignments({ userId, profile, onUpdated }: Props) {
  const [hostelOptions, setHostelOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const assignedIds = useMemo(
    () => new Set(profile.assignments?.map((a) => a.hostelId) ?? []),
    [profile.assignments],
  );

  useEffect(() => {
    setSelected(new Set(assignedIds));
  }, [assignedIds]);

  useEffect(() => {
    let cancelled = false;
    void fetchStaffDirectorySummary('all').then((result) => {
      if (cancelled) return;
      const options = result.summary?.facets.hostelOptions ?? [];
      setHostelOptions(options);
      setLoadingOptions(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(() => {
    if (selected.size !== assignedIds.size) return true;
    for (const id of selected) {
      if (!assignedIds.has(id)) return true;
    }
    return false;
  }, [assignedIds, selected]);

  const toggle = (hostelId: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(hostelId);
      } else {
        next.delete(hostelId);
      }
      return next;
    });
  };

  const save = useCallback(async () => {
    setSaving(true);
    const result = await updateStaffHostelAssignments(userId, [...selected]);
    setSaving(false);
    if (result.error || !result.profile) {
      toast.error('Could not save assignments', { description: result.error ?? 'Unknown error' });
      return;
    }
    onUpdated(result.profile);
    toast.success('Hostel assignments updated');
  }, [onUpdated, selected, userId]);

  const wardenInCharge = profile.wardenInCharge ?? [];

  return (
    <article className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-forest)_12%,var(--border))] bg-card p-4 shadow-sm sm:p-5 lg:col-span-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Hostel assignments</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Live from the API — controls which hostels appear in the warden switcher and desk scope.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!dirty || saving}
          onClick={() => void save()}
          className="h-9 gap-1.5 rounded-xl"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          Save assignments
        </Button>
      </div>

      {wardenInCharge.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Warden in charge:{' '}
          <span className="font-medium text-foreground">
            {wardenInCharge.map((h) => h.hostelName).join(' · ')}
          </span>
          {' '}
          (set under Hostels infrastructure; separate from multi-assign below.)
        </p>
      ) : null}

      {loadingOptions ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading hostels…
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {hostelOptions.map((hostel) => {
            const checked = selected.has(hostel.id);
            return (
              <li key={hostel.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                    checked
                      ? 'border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]'
                      : 'border-border bg-muted/20 hover:bg-muted/40',
                    focusRing,
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggle(hostel.id, value === true)}
                    aria-label={hostel.name}
                  />
                  <span className="font-medium text-foreground">{hostel.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
