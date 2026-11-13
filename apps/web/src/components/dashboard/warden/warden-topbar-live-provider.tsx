'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { useWardenTopbarLive } from '@/hooks/use-warden-topbar-live';

type WardenTopbarLiveContextValue = ReturnType<typeof useWardenTopbarLive>;

const WardenTopbarLiveContext = createContext<WardenTopbarLiveContextValue | null>(null);

export function WardenTopbarLiveProvider({ children }: { children: ReactNode }) {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const hostelName =
    assignedHostels.find((h) => h.id === selectedHostelId)?.label ?? assignedHostels[0]?.label ?? 'Assigned hostel';

  const live = useWardenTopbarLive({ selectedHostelId, hostelName });
  const value = useMemo(() => live, [live]);

  return <WardenTopbarLiveContext.Provider value={value}>{children}</WardenTopbarLiveContext.Provider>;
}

export function useWardenTopbarLiveContext() {
  const context = useContext(WardenTopbarLiveContext);
  if (!context) {
    throw new Error('useWardenTopbarLiveContext must be used within WardenTopbarLiveProvider.');
  }
  return context;
}
