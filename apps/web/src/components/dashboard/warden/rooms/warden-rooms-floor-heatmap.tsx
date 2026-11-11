'use client';

import { useMemo } from 'react';

import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { cn } from '@/lib/utils';

type Props = {
  rooms: RoomRecord[];
};

export function WardenRoomsFloorHeatmap({ rooms }: Props) {
  const floors = useMemo(() => {
    const map = new Map<string, { total: number; occupied: number }>();
    for (const room of rooms) {
      const key = `${room.block} · ${room.floor}`;
      const prev = map.get(key) ?? { total: 0, occupied: 0 };
      prev.total += room.capacity;
      prev.occupied += room.occupiedBeds;
      map.set(key, prev);
    }
    return [...map.entries()]
      .map(([label, data]) => ({
        label,
        pct: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
        open: Math.max(0, data.total - data.occupied),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rooms]);

  if (floors.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
      aria-label="Vacancy heatmap by floor"
    >
      <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Vacancy heatmap</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Darker fill = higher occupancy · open beds beside each bar</p>
      <ul className="mt-4 space-y-3">
        {floors.map((row) => (
          <li key={row.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-foreground">{row.label}</span>
              <span className="text-muted-foreground">
                {row.pct}% full · <span className="font-medium text-[var(--nestora-sage)]">{row.open} open</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-500',
                  row.pct >= 90 ? 'bg-[var(--nestora-forest)]' : row.pct >= 70 ? 'bg-[var(--nestora-gold)]' : 'bg-[#6d9773]',
                )}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
