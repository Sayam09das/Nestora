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

import { WARDEN_HOSTEL_STORAGE_KEY } from '@/components/dashboard/warden/warden-topbar-data';

const STORAGE_KEY = 'nestora-warden-sidebar-collapsed';

type WardenShellContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
  toggleMobileNav: () => void;
  selectedHostelId: string;
  setSelectedHostelId: (id: string) => void;
};

const WardenShellContext = createContext<WardenShellContextValue | null>(null);

export function WardenShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedHostelId, setSelectedHostelIdState] = useState('boys-a');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      setSidebarCollapsedState(localStorage.getItem(STORAGE_KEY) === '1');
      const storedHostel = localStorage.getItem(WARDEN_HOSTEL_STORAGE_KEY);
      if (storedHostel) setSelectedHostelIdState(storedHostel);
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

  const setSelectedHostelId = useCallback((id: string) => {
    setSelectedHostelIdState(id);
    try {
      localStorage.setItem(WARDEN_HOSTEL_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed: hydrated ? sidebarCollapsed : false,
      toggleSidebar,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen: setMobileNavOpenStable,
      toggleMobileNav,
      selectedHostelId: hydrated ? selectedHostelId : 'boys-a',
      setSelectedHostelId,
    }),
    [
      hydrated,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpenStable,
      toggleMobileNav,
      selectedHostelId,
      setSelectedHostelId,
    ],
  );

  return <WardenShellContext.Provider value={value}>{children}</WardenShellContext.Provider>;
}

export function useWardenShell() {
  const context = useContext(WardenShellContext);
  if (!context) {
    throw new Error('useWardenShell must be used within WardenShellProvider.');
  }
  return context;
}
