'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'nestora-admin-sidebar-collapsed';

type AdminShellContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
  toggleMobileNav: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      setSidebarCollapsedState(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      // ignore
    }
  }, []);

  const setSidebarCollapsed = useCallback((value: boolean) => {
    setSidebarCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setMobileNavOpenStable = useCallback((value: boolean) => {
    setMobileNavOpen(value);
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((open) => !open);
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed: hydrated ? sidebarCollapsed : false,
      toggleSidebar,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen: setMobileNavOpenStable,
      toggleMobileNav,
    }),
    [
      hydrated,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpenStable,
      toggleMobileNav,
    ],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) {
    throw new Error('useAdminShell must be used within AdminShellProvider.');
  }
  return context;
}
