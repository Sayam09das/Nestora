'use client';

import { Building2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type Props = {
  hostelName: string;
};

export function WardenAnnouncementsScopeBadge({ hostelName }: Props) {
  return (
    <p data-ann-reveal className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="outline" className="gap-1.5 font-semibold text-[var(--nestora-forest)]">
        <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
        {hostelName}
      </Badge>
      <span>Includes university-wide notices visible to your residents (MOD-17 · FR-086).</span>
    </p>
  );
}
