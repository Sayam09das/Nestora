'use client';

import { useCallback, useEffect, useState } from 'react';

import type { RoleProfile } from '@/components/dashboard/roles/admin-roles-data';
import {
  fetchRolesDeskProfiles,
  fetchRolesDeskSummary,
  type RolesDeskSummary,
} from '@/lib/api/roles-desk';

export type RolesDeskFilters = {
  q: string;
  tier: string;
  scope: string;
  risk: string;
};

type Options = { pollIntervalMs?: number };

export function useRolesDesk(filters: RolesDeskFilters, options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [summary, setSummary] = useState<RolesDeskSummary | null>(null);
  const [roles, setRoles] = useState<RoleProfile[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchRolesDeskSummary();
    if (result.summary) {
      setSummary(result.summary);
      setError(null);
    } else if (result.error) {
      setError(result.error);
    }
    if (!opts?.silent) setLoadingSummary(false);
  }, []);

  const loadList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingList(true);
      const result = await fetchRolesDeskProfiles({
        q: filters.q,
        tier: filters.tier,
        scope: filters.scope,
        risk: filters.risk,
      });
      if (result.roles) {
        setRoles(result.roles);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setRoles([]);
      }
      if (!opts?.silent) setLoadingList(false);
    },
    [filters],
  );

  useEffect(() => {
    void loadSummary();
    const interval = setInterval(() => void loadSummary({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadSummary, pollIntervalMs]);

  useEffect(() => {
    void loadList();
    const interval = setInterval(() => void loadList({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadList, pollIntervalMs]);

  useEffect(() => {
    const onFocus = () => {
      void loadSummary({ silent: true });
      void loadList({ silent: true });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadList, loadSummary]);

  const refresh = useCallback(() => {
    setLoadingSummary(true);
    setLoadingList(true);
    void loadSummary();
    void loadList();
  }, [loadList, loadSummary]);

  return { summary, roles, loadingSummary, loadingList, error, refresh };
}
