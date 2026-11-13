'use client';

import { DoorOpen, LogIn, UserPlus, Users } from 'lucide-react';

import type { VisitorDeskSummary } from '@/lib/api/visitors';

type Props = { summary: VisitorDeskSummary | null; loading?: boolean };

export function WardenVisitorsStatsStrip({ summary, loading = false }: Props) {
  const cards = [
    { label: 'Visitors today', value: summary?.totalToday ?? (loading ? '…' : 0), icon: Users },
    { label: 'Pending approval', value: summary?.pendingApproval ?? (loading ? '…' : 0), icon: UserPlus },
    { label: 'Inside hostel', value: summary?.insideNow ?? (loading ? '…' : 0), icon: LogIn },
    { label: 'Checked out today', value: summary?.checkedOutToday ?? (loading ? '…' : 0), icon: DoorOpen },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <li
            key={card.label}
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
              <Icon className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{card.value}</p>
          </li>
        );
      })}
    </ul>
  );
}
