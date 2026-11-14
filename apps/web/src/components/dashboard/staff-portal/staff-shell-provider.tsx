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

import {
  createStaffPermissionsForRole,
  STAFF_ROLE_LABELS,
  type StaffDutyRole,
  type StaffNavPermission,
} from '@/components/dashboard/staff-portal/staff-nav-permissions';
import {
  getStaffShiftDisplay,
  STAFF_DEMO_WORKPLACE,
  STAFF_DUTY_ROLE_STORAGE_KEY,
  type StaffShiftDisplay,
} from '@/components/dashboard/staff-portal/staff-topbar-data';
import { fetchCurrentUser } from '@/lib/api/auth';

const STORAGE_KEY = 'nestora-staff-sidebar-collapsed';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'ST';
}

function readDutyRoleFromStorage(): StaffDutyRole | null {
  try {
    const raw = localStorage.getItem(STAFF_DUTY_ROLE_STORAGE_KEY);
    if (!raw) return null;
    if (raw in STAFF_ROLE_LABELS) return raw as StaffDutyRole;
  } catch {
    // ignore
  }
  return null;
}

type StaffShellContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
  toggleMobileNav: () => void;
  dutyRole: StaffDutyRole;
  navPermissions: ReadonlySet<StaffNavPermission>;
  displayName: string;
  roleLabel: string;
  initials: string;
  workplaceName: string;
  setWorkplaceName: (name: string) => void;
  shift: StaffShiftDisplay;
};

const StaffShellContext = createContext<StaffShellContextValue | null>(null);

export function StaffShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [dutyRole, setDutyRole] = useState<StaffDutyRole>('security_guard');
  const [displayName, setDisplayName] = useState('Rahul Sharma');
  const [workplaceName, setWorkplaceName] = useState('Assigned hostel');

  useEffect(() => {
    setHydrated(true);
    try {
      setSidebarCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
      const storedRole = readDutyRoleFromStorage();
      if (storedRole) setDutyRole(storedRole);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refreshUser = () => {
      void fetchCurrentUser().then(({ user }) => {
        if (cancelled || !user) return;
        const name = `${user.firstName} ${user.lastName}`.trim() || 'Staff';
        setDisplayName(name);
        if (user.role === 'SECURITY_GUARD') {
          setDutyRole('security_guard');
        }
      });
    };
    refreshUser();
    const interval = window.setInterval(refreshUser, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshUser();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const setSidebarCollapsedPersisted = useCallback((value: boolean) => {
    setSidebarCollapsed(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
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

  const navPermissions = useMemo(() => createStaffPermissionsForRole(dutyRole), [dutyRole]);
  const roleLabel = STAFF_ROLE_LABELS[dutyRole];
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const shift = useMemo(() => getStaffShiftDisplay(dutyRole), [dutyRole]);

  const value = useMemo(
    () => ({
      sidebarCollapsed: hydrated ? sidebarCollapsed : false,
      toggleSidebar,
      setSidebarCollapsed: setSidebarCollapsedPersisted,
      mobileNavOpen,
      setMobileNavOpen,
      toggleMobileNav,
      dutyRole,
      navPermissions,
      displayName,
      roleLabel,
      initials,
      workplaceName,
      setWorkplaceName,
      shift,
    }),
    [
      hydrated,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsedPersisted,
      mobileNavOpen,
      toggleMobileNav,
      dutyRole,
      navPermissions,
      displayName,
      roleLabel,
      initials,
      workplaceName,
      shift,
    ],
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
