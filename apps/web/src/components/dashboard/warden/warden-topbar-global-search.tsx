'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { wardenNavLinks } from '@/components/dashboard/warden/warden-nav-items';
import { SAMPLE_WARDEN_SEARCH_HITS } from '@/components/dashboard/warden/warden-topbar-data';
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

export function WardenTopbarGlobalSearch({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_WARDEN_SEARCH_HITS;
    return SAMPLE_WARDEN_SEARCH_HITS.filter(
      (hit) =>
        hit.label.toLowerCase().includes(q) ||
        hit.hint.toLowerCase().includes(q) ||
        hit.category.toLowerCase().includes(q),
    );
  }, [query]);

  const go = (href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  };

  const students = filteredHits.filter((h) => h.category === 'Students');
  const rooms = filteredHits.filter((h) => h.category === 'Rooms');
  const complaints = filteredHits.filter((h) => h.category === 'Complaints');

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery('');
      }}
      title="Global search"
      description="Search students, rooms, and complaints in your hostel scope."
    >
      <CommandInput placeholder="Search students, rooms, complaints…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No matches. Try a room number or student name.</CommandEmpty>
        {students.length > 0 ? (
          <CommandGroup heading="Students">
            {students.map((hit) => {
              const Icon = hit.icon;
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
              const Icon = hit.icon;
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
              const Icon = hit.icon;
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
          {wardenNavLinks.map((item) => {
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
