'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { filterStudentNavGroups, flattenStudentNavLinks, studentNavGroups } from '@/components/dashboard/student-portal/student-nav-items';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { SAMPLE_STUDENT_SEARCH_HITS } from '@/components/dashboard/student-portal/student-topbar-data';
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

  const navLinks = useMemo(
    () => flattenStudentNavLinks(filterStudentNavGroups(studentNavGroups, navPermissions)),
    [navPermissions],
  );

  const filteredHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_STUDENT_SEARCH_HITS;
    return SAMPLE_STUDENT_SEARCH_HITS.filter(
      (hit) =>
        hit.label.toLowerCase().includes(q) ||
        hit.hint.toLowerCase().includes(q) ||
        hit.category.toLowerCase().includes(q),
    );
  }, [query]);

  const byCategory = (cat: string) => filteredHits.filter((h) => h.category === cat);

  const go = (href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  };

  const categories = [...new Set(filteredHits.map((h) => h.category))];

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
        <CommandEmpty>No matches in your scope.</CommandEmpty>
        {categories.map((category) => {
          const hits = byCategory(category);
          if (hits.length === 0) return null;
          return (
            <CommandGroup key={category} heading={category}>
              {hits.map((hit) => (
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
          {navLinks.map((link) => (
            <CommandItem key={link.id} value={link.label} onSelect={() => go(link.href)}>
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
