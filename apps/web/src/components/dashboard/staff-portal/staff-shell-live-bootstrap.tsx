'use client';

import { useEffect } from 'react';

import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { fetchStaffDashboardOverview } from '@/lib/api/dashboard';

const LIVE_POLL_MS = 20_000;

/** Resolves assigned hostel display names for the staff topbar (replaces raw UUID labels). */
export function StaffShellLiveBootstrap() {
  const { setWorkplaceName } = useStaffShell();

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const { overview } = await fetchStaffDashboardOverview();
      if (cancelled || !overview) return;

      const { hostelNames, unassigned } = overview.scope;
      if (unassigned || hostelNames.length === 0) {
        setWorkplaceName('No hostel assigned');
        return;
      }

      setWorkplaceName(hostelNames.length === 1 ? hostelNames[0]! : hostelNames.join(' · '));
    };

    void sync();
    const interval = window.setInterval(() => {
      void sync();
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void sync();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [setWorkplaceName]);

  return null;
}