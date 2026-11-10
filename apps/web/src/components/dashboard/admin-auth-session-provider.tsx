'use client';

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

const KEEPALIVE_MS = 5 * 60 * 1000;

type AdminAuthContextValue = {
  user: AuthUserPayload | null;
  refresh: () => Promise<boolean>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuthSession(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuthSession must be used within AdminAuthSessionProvider.');
  }
  return ctx;
}

async function probeSession(): Promise<{
  user: AuthUserPayload | null;
  unauthorized: boolean;
}> {
  const result = await fetchCurrentUser();
  if (result.user) {
    return { user: result.user, unauthorized: false };
  }
  if (result.status === 401) {
    return { user: null, unauthorized: true };
  }
  return { user: null, unauthorized: false };
}

export function AdminAuthSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUserPayload | null>(null);
  const [ready, setReady] = useState(false);
  const hadUserRef = useRef(false);

  const applyProbe = useCallback((next: { user: AuthUserPayload | null; unauthorized: boolean }) => {
    if (next.user) {
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
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    const next = await probeSession();
    return applyProbe(next);
  }, [applyProbe]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => {
      void refresh();
    }, KEEPALIVE_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [refresh]);

  useEffect(() => {
    if (!ready || user) {
      return;
    }
    router.replace(`/admin/login?returnTo=${encodeURIComponent(pathname)}`);
  }, [ready, user, pathname, router]);

  const value = useMemo(() => ({ user, refresh }), [user, refresh]);

  if (!ready) {
    return (
      <p className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Restoring your session…
      </p>
    );
  }

  if (!user) {
    return null;
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
