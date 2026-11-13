'use client';

import { useEffect } from 'react';

import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { fetchWardenDashboardOverview } from '@/lib/api/dashboard';

const LIVE_POLL_MS = 20_000;

/** Keeps assigned hostels and default selection in sync on every warden route. */
export function WardenShellHostelBootstrap() {
  const { selectedHostelId, setSelectedHostelId, setAssignedHostels } = useWardenShell();

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      // Always load the full assignment list (metrics scoping uses hostelId elsewhere).
      const { overview } = await fetchWardenDashboardOverview();
      if (cancelled || !overview?.hostels.length) return;

      setAssignedHostels(overview.hostels.map((h) => ({ id: h.id, label: h.name })));
      if (!overview.hostels.some((h) => h.id === selectedHostelId)) {
        setSelectedHostelId(overview.hostels[0]!.id);
      }
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
  }, [selectedHostelId, setAssignedHostels, setSelectedHostelId]);

  return null;
}
