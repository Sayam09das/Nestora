'use client';

import { dashboardPathForRole } from '@nestora/types';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { fetchCurrentUser, type AuthUserPayload } from '@/lib/api/auth';
import { NESTORA_UNAUTHORIZED_EVENT } from '@/lib/api/client';

const KEEPALIVE_MS = 5 * 60 * 1000;

type RoleAuthContextValue = {
  user: AuthUserPayload | null;
  refresh: () => Promise<boolean>;
};

const RoleAuthContext = createContext<RoleAuthContextValue | null>(null);

export function useRoleAuthSession(): RoleAuthContextValue {
  const ctx = useContext(RoleAuthContext);
  if (!ctx) {
    throw new Error('useRoleAuthSession must be used within RoleAuthSessionProvider.');
  }
  return ctx;
}

type RoleAuthSessionProviderProps = {
  children: ReactNode;
  allowedRoles: Array<'HOSTEL_WARDEN' | 'HOSTEL_STAFF' | 'STUDENT'>;
  homePath: string;
};

export function RoleAuthSessionProvider({ children, allowedRoles, homePath }: RoleAuthSessionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUserPayload | null>(null);
  const [ready, setReady] = useState(false);
  const hadUserRef = useRef(false);

  const applyProbe = useCallback(
    (next: { user: AuthUserPayload | null; unauthorized: boolean }) => {
      if (next.user) {
        if (!allowedRoles.includes(next.user.role as 'HOSTEL_WARDEN' | 'HOSTEL_STAFF' | 'STUDENT')) {
          router.replace(dashboardPathForRole(next.user.role));
          return false;
        }
        hadUserRef.current = true;
        setUser(next.user);
        setReady(true);
        return true;
      }
      if (next.unauthorized) {
        hadUserRef.current = false;
        setUser(null);
        setReady(true);
        return false;
      }
      setReady(true);
      return hadUserRef.current;
    },
    [allowedRoles, router],
  );

  const refresh = useCallback(async (): Promise<boolean> => {
    const result = await fetchCurrentUser();
    const unauthorized = result.status === 401;
    return applyProbe({ user: result.user ?? null, unauthorized });
  }, [applyProbe]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onUnauthorized = () => {
      hadUserRef.current = false;
      setUser(null);
      setReady(true);
    };
    window.addEventListener(NESTORA_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(NESTORA_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => void refresh(), KEEPALIVE_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [refresh]);

  useEffect(() => {
    if (!ready || user) return;
    router.replace(`/login?returnTo=${encodeURIComponent(pathname || homePath)}`);
  }, [ready, user, pathname, homePath, router]);

  const value = useMemo(() => ({ user, refresh }), [user, refresh]);

  if (!ready) {
    return (
      <p className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Restoring your session…
      </p>
    );
  }

  if (!user) return null;

  return <RoleAuthContext.Provider value={value}>{children}</RoleAuthContext.Provider>;
}
