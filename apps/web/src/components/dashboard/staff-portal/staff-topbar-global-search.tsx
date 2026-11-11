'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  filterStaffNavGroups,
  flattenStaffNavLinks,
  staffNavGroups,
} from '@/components/dashboard/staff-portal/staff-nav-items';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { SAMPLE_STAFF_SEARCH_HITS } from '@/components/dashboard/staff-portal/staff-topbar-data';
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
  const [query, setQuery] = useState('');

  const allowedModules = useMemo(
    () => flattenStaffNavLinks(filterStaffNavGroups(staffNavGroups, navPermissions)),
    [navPermissions],
  );

  const filteredHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_STAFF_SEARCH_HITS;
    return SAMPLE_STAFF_SEARCH_HITS.filter(
      (hit) =>
        hit.label.toLowerCase().includes(q) ||
        hit.hint.toLowerCase().includes(q) ||
        hit.category.toLowerCase().includes(q),
    );
  }, [query]);

  const tasks = filteredHits.filter((h) => h.category === 'Tasks');
  const visitors = filteredHits.filter((h) => h.category === 'Visitors');
  const notices = filteredHits.filter((h) => h.category === 'Notices');
  const maintenance = filteredHits.filter((h) => h.category === 'Maintenance');

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
        <CommandEmpty>No matches in your scope.</CommandEmpty>

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
