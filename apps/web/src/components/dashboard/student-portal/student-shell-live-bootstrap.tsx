'use client';

import { useEffect } from 'react';

import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { useStudentTopbarLiveContext } from '@/components/dashboard/student-portal/student-topbar-live-provider';

/** Syncs residence + nav badges from the shared 20s overview poll used by the topbar. */
export function StudentShellLiveBootstrap() {
  const { syncFromOverview } = useStudentShell();
  const { latestOverview } = useStudentTopbarLiveContext();

  useEffect(() => {
    if (latestOverview) {
      syncFromOverview(latestOverview);
    }
  }, [latestOverview, syncFromOverview]);

  return null;
}