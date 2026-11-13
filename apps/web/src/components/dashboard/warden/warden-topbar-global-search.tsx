'use client';

import { BedDouble, MessageSquareWarning, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { filterWardenNavGroups, flattenWardenNavLinks, wardenNavGroups } from '@/components/dashboard/warden/warden-nav-items';
import { createDefaultWardenPermissions } from '@/components/dashboard/warden/warden-nav-permissions';
import { useWardenTopbarLiveContext } from '@/components/dashboard/warden/warden-topbar-live-provider';
import type { WardenTopbarSearchHit } from '@/hooks/use-warden-topbar-live';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

const categoryIcon = {
  Students: UserRound,
  Rooms: BedDouble,
  Complaints: MessageSquareWarning,
} as const;

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function WardenTopbarGlobalSearch({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { search } = useWardenTopbarLiveContext();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<WardenTopbarSearchHit[]>([]);
  const [searching, setSearching] = useState(false);

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

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery('');
      setHits([]);
      router.push(href);
    },
    [onOpenChange, router],
  );

  const deskModules = useMemo(
    () => flattenWardenNavLinks(filterWardenNavGroups(wardenNavGroups, createDefaultWardenPermissions())),
    [],
  );

  const students = hits.filter((h) => h.category === 'Students');
  const rooms = hits.filter((h) => h.category === 'Rooms');
  const complaints = hits.filter((h) => h.category === 'Complaints');

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setQuery('');
          setHits([]);
        }
      }}
      title="Global search"
      description="Search students, rooms, and complaints in your assigned hostel."
    >
      <CommandInput placeholder="Search students, rooms, complaints…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>
          {searching
            ? 'Searching…'
            : query.trim().length < 2
              ? 'Type at least 2 characters to search live directory data.'
              : 'No matches. Try a room number or student name.'}
        </CommandEmpty>
        {students.length > 0 ? (
          <CommandGroup heading="Students">
            {students.map((hit) => {
              const Icon = categoryIcon.Students;
              return (
                <CommandItem key={hit.id} onSelect={() => go(hit.href)}>
                  <Icon className="size-4 opacity-70" />
                  <span>{hit.label}</span>
                  <span className="ml-2 text-muted-foreground">{hit.hint}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
        {rooms.length > 0 ? (
          <CommandGroup heading="Rooms">
            {rooms.map((hit) => {
              const Icon = categoryIcon.Rooms;
              return (
                <CommandItem key={hit.id} onSelect={() => go(hit.href)}>
                  <Icon className="size-4 opacity-70" />
                  <span>{hit.label}</span>
                  <span className="ml-2 text-muted-foreground">{hit.hint}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
        {complaints.length > 0 ? (
          <CommandGroup heading="Complaints">
            {complaints.map((hit) => {
              const Icon = categoryIcon.Complaints;
              return (
                <CommandItem key={hit.id} onSelect={() => go(hit.href)}>
                  <Icon className="size-4 opacity-70" />
                  <span>{hit.label}</span>
                  <span className="ml-2 text-muted-foreground">{hit.hint}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading="Desk modules">
          {deskModules.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <Icon className="size-4 opacity-70" />
                <span>{item.label}</span>
                {item.hint ? <span className="ml-2 text-muted-foreground">{item.hint}</span> : null}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
