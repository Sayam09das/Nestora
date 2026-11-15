'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { filterStudentNavGroups, flattenStudentNavLinks, studentNavGroups } from '@/components/dashboard/student-portal/student-nav-items';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { useStudentTopbarLiveContext } from '@/components/dashboard/student-portal/student-topbar-live-provider';
import type { StudentTopbarSearchHit } from '@/hooks/use-student-topbar-live';
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

export function StudentTopbarGlobalSearch({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { navPermissions } = useStudentShell();
  const { search, defaultSearchHits } = useStudentTopbarLiveContext();
  const [hits, setHits] = useState<StudentTopbarSearchHit[]>(defaultSearchHits);
  const [searching, setSearching] = useState(false);

  const navLinks = useMemo(
    () => flattenStudentNavLinks(filterStudentNavGroups(studentNavGroups, navPermissions)),
    [navPermissions],
  );

  useEffect(() => {
    setHits(defaultSearchHits);
  }, [defaultSearchHits]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits(defaultSearchHits);
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
  }, [query, search, defaultSearchHits]);

  const byCategory = (cat: StudentTopbarSearchHit['category']) => hits.filter((h) => h.category === cat);

  const go = (href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  };

  const categories = [...new Set(hits.map((h) => h.category))];
  const filteredNav =
    query.trim().length >= 1
      ? navLinks.filter((link) => link.label.toLowerCase().includes(query.trim().toLowerCase()))
      : navLinks;

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery('');
      }}
      title="Global search"
      description="Search notices, services, and help within your student access."
    >
      <CommandInput placeholder="Search notices, services, help…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>{searching ? 'Searching…' : 'No matches in your scope.'}</CommandEmpty>
        {categories.map((category) => {
          const rows = byCategory(category);
          if (rows.length === 0) return null;
          return (
            <CommandGroup key={category} heading={category}>
              {rows.map((hit) => (
                <CommandItem key={hit.id} value={hit.label} onSelect={() => go(hit.href)}>
                  <span className="font-medium">{hit.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{hit.hint}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {filteredNav.map((link) => (
            <CommandItem key={link.id} value={link.label} onSelect={() => go(link.href)}>
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}