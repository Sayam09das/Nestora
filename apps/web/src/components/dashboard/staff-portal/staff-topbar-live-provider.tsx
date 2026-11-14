'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { useStaffTopbarLive } from '@/hooks/use-staff-topbar-live';

type StaffTopbarLiveContextValue = ReturnType<typeof useStaffTopbarLive>;

const StaffTopbarLiveContext = createContext<StaffTopbarLiveContextValue | null>(null);

export function StaffTopbarLiveProvider({ children }: { children: ReactNode }) {
  const { workplaceName, displayName } = useStaffShell();
  const live = useStaffTopbarLive({ workplaceName, displayName });
  const value = useMemo(() => live, [live]);

  return <StaffTopbarLiveContext.Provider value={value}>{children}</StaffTopbarLiveContext.Provider>;
}

export function useStaffTopbarLiveContext() {
  const context = useContext(StaffTopbarLiveContext);
  if (!context) {
    throw new Error('useStaffTopbarLiveContext must be used within StaffTopbarLiveProvider.');
  }
  return context;
}