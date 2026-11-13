'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminRolesDetailPage } from '@/components/dashboard/roles/admin-roles-detail-page';
import type { RoleProfile } from '@/components/dashboard/roles/admin-roles-data';
import { fetchRoleDeskDetail } from '@/lib/api/roles-desk';
import { Button } from '@/components/ui/button';

export function AdminRolesDetailRoute({ roleId }: { roleId: string }) {
  const [role, setRole] = useState<RoleProfile | null>(null);
  const [assignments, setAssignments] = useState<Array<{ user: string; hostel: string; since: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchRoleDeskDetail(roleId);
      if (cancelled) return;
      if (result.detail) {
        setRole(result.detail.profile);
        setAssignments(result.detail.assignments);
        setError(null);
      } else {
        setError(result.error ?? 'Role not found.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [roleId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading role profile…</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-destructive">{error ?? 'Role not found.'}</p>
        <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href="/admin/roles">Back to roles</Link>} />
      </div>
    );
  }

  return <AdminRolesDetailPage role={role} assignments={assignments} />;
}
