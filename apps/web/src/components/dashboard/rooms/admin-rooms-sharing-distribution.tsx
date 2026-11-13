'use client';

import { motion } from 'framer-motion';
import { BedDouble, LayoutGrid } from 'lucide-react';
import { useMemo } from 'react';

import type { RoomDirectorySummary, RoomSharingDistributionRow } from '@/lib/api/rooms';
import { cn } from '@/lib/utils';

const BAR_COLORS: Record<number, string> = {
  1: 'var(--nestora-gold)',
  2: 'var(--nestora-sage)',
  3: '#6d9773',
};

const motionEase = [0.22, 1, 0.36, 1] as const;

type AdminRoomsSharingDistributionProps = {
  summary: RoomDirectorySummary | null;
  loading?: boolean;
};

function DistributionBar({
  rows,
  totalRooms,
  loading,
}: {
  rows: RoomSharingDistributionRow[];
  totalRooms: number;
  loading: boolean;
}) {
  if (loading || totalRooms === 0) {
    return (
      <div className="flex h-3 overflow-hidden rounded-full bg-[#e7e7dc]" aria-hidden>
        <div className="h-full w-full animate-pulse bg-muted/50" />
      </div>
    );
  }

  return (
    <div
      className="flex h-3 overflow-hidden rounded-full bg-[#e7e7dc]"
      role="img"
      aria-label="Room type distribution"
    >
      {rows.map((row) => {
        const pct = (row.rooms / totalRooms) * 100;
        if (pct <= 0) return null;
        return (
          <motion.div
            key={row.capacity}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: motionEase }}
            className="h-full shrink-0 origin-left"
            style={{
              width: `${pct}%`,
              backgroundColor: BAR_COLORS[row.capacity] ?? 'var(--nestora-forest)',
            }}
            title={`${row.roomType}: ${row.rooms} rooms (${Math.round(pct * 10) / 10}%)`}
          />
        );
      })}
    </div>
  );
}

export function AdminRoomsSharingDistribution({ summary, loading = false }: AdminRoomsSharingDistributionProps) {
  const rows = summary?.sharingDistribution ?? [];
  const totalRooms = summary?.totalRooms ?? 0;
  const totalBeds = summary?.totalBeds ?? 0;

  const legend = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        roomPct: totalRooms > 0 ? Math.round((row.rooms / totalRooms) * 1000) / 10 : 0,
      })),
    [rows, totalRooms],
  );

  const totalsFromRows = useMemo(() => {
    const rooms = rows.reduce((acc, r) => acc + r.rooms, 0);
    const beds = rows.reduce((acc, r) => acc + r.totalBeds, 0);
    return { rooms, beds };
  }, [rows]);

  return (
    <section
      aria-labelledby="rooms-sharing-distribution-heading"
      className="space-y-3 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
            Hostel room &amp; bed distribution
          </p>
          <h2 id="rooms-sharing-distribution-heading" className="mt-0.5 text-base font-semibold text-[var(--nestora-forest)]">
            Room type distribution
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Distribution of {loading ? '—' : totalRooms.toLocaleString('en-IN')} hostel rooms · live from inventory
          </p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_30%,var(--card))] px-2.5 py-1 font-semibold text-[var(--nestora-forest)]">
            <LayoutGrid className="size-3.5" aria-hidden />
            {loading ? '—' : totalRooms.toLocaleString('en-IN')} rooms
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] px-2.5 py-1 font-semibold text-[var(--nestora-forest)]">
            <BedDouble className="size-3.5" aria-hidden />
            {loading ? '—' : totalBeds.toLocaleString('en-IN')} beds
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <DistributionBar rows={rows} totalRooms={totalRooms} loading={loading} />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {legend.map((item) => (
            <li key={item.capacity} className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: BAR_COLORS[item.capacity] ?? 'var(--border)' }}
                aria-hidden
              />
              <span className="font-medium text-foreground">{item.roomType}</span>
              <span className="tabular-nums">
                {loading ? '—' : item.rooms} ({loading ? '—' : `${item.roomPct}%`})
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--border))]">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--nestora-sage-muted)]/80 bg-[color-mix(in_oklch,var(--nestora-cream)_22%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nestora-sage)]">
              <th className="px-3 py-2.5 font-bold">Room type</th>
              <th className="px-3 py-2.5 font-bold">Rooms</th>
              <th className="px-3 py-2.5 font-bold">Beds per room</th>
              <th className="px-3 py-2.5 font-bold text-right">Total beds</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Loading distribution…
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row, index) => (
                  <tr
                    key={row.capacity}
                    className={cn(
                      'border-b border-border/60 transition-colors hover:bg-[color-mix(in_oklch,var(--nestora-sage)_6%,var(--card))]',
                      index === rows.length - 1 && 'border-b-0',
                    )}
                  >
                    <td className="px-3 py-2.5 font-medium text-[var(--nestora-forest)]">{row.roomType}</td>
                    <td className="px-3 py-2.5 tabular-nums">{row.rooms.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 tabular-nums">{row.bedsPerRoom}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium">{row.totalBeds.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                <tr className="bg-[color-mix(in_oklch,var(--nestora-forest)_5%,var(--card))] font-semibold text-[var(--nestora-forest)]">
                  <td className="px-3 py-2.5">Total</td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {loading ? '—' : (totalRooms || totalsFromRows.rooms).toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">—</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {loading ? '—' : (totalBeds || totalsFromRows.beds).toLocaleString('en-IN')}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}
