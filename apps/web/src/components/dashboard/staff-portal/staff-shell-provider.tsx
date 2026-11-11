'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'nestora-staff-sidebar-collapsed';
type StaffShellContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
  toggleMobileNav: () => void;
};

const StaffShellContext = createContext<StaffShellContextValue | null>(null);

export function StaffShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((open) => !open);
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
      toggleMobileNav,
    }),
    [sidebarCollapsed, toggleSidebar, mobileNavOpen, toggleMobileNav],
  );

  return <StaffShellContext.Provider value={value}>{children}</StaffShellContext.Provider>;
}

export function useStaffShell(): StaffShellContextValue {
  const ctx = useContext(StaffShellContext);
  if (!ctx) {
    throw new Error('useStaffShell must be used within StaffShellProvider');
  }
  return ctx;
}
