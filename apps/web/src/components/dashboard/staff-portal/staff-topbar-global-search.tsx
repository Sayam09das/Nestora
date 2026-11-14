'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  filterStaffNavGroups,
  flattenStaffNavLinks,
  staffNavGroups,
} from '@/components/dashboard/staff-portal/staff-nav-items';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { useStaffTopbarLiveContext } from '@/components/dashboard/staff-portal/staff-topbar-live-provider';
import type { StaffTopbarSearchHit } from '@/hooks/use-staff-topbar-live';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function StaffTopbarGlobalSearch({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { navPermissions } = useStaffShell();
  const { search } = useStaffTopbarLiveContext();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<StaffTopbarSearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  const allowedModules = useMemo(
    () => flattenStaffNavLinks(filterStaffNavGroups(staffNavGroups, navPermissions)),
    [navPermissions],
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = window.setTimeout(() => {
      void search(q).then((rows) => {
        setHits(rows);
        setSearching(false);
      });
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query, search]);

  const tasks = hits.filter((h) => h.category === 'Tasks');
  const visitors = hits.filter((h) => h.category === 'Visitors');
  const notices = hits.filter((h) => h.category === 'Notices');
  const maintenance = hits.filter((h) => h.category === 'Maintenance');

  const go = (href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery('');
      }}
      title="Global search"
      description="Search tasks, visitors, and notices within your staff permissions."
    >
      <CommandInput
        placeholder="Search tasks, visitors, notices…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{searching ? 'Searching…' : 'No matches in your scope.'}</CommandEmpty>

        {tasks.length > 0 ? (
          <CommandGroup heading="Tasks">
            {tasks.map((hit) => (
              <CommandItem key={hit.id} value={hit.label} onSelect={() => go(hit.href)}>
                <span className="font-medium">{hit.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{hit.hint}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {visitors.length > 0 ? (
          <CommandGroup heading="Visitors">
            {visitors.map((hit) => (
              <CommandItem key={hit.id} value={hit.label} onSelect={() => go(hit.href)}>
                <span className="font-medium">{hit.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{hit.hint}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {maintenance.length > 0 ? (
          <CommandGroup heading="Maintenance">
            {maintenance.map((hit) => (
              <CommandItem key={hit.id} value={hit.label} onSelect={() => go(hit.href)}>
                <span className="font-medium">{hit.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{hit.hint}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {notices.length > 0 ? (
          <CommandGroup heading="Notices">
            {notices.map((hit) => (
              <CommandItem key={hit.id} value={hit.label} onSelect={() => go(hit.href)}>
                <span className="font-medium">{hit.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{hit.hint}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {allowedModules.map((link) => (
            <CommandItem key={link.id} value={link.label} onSelect={() => go(link.href)}>
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
