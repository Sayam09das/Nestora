'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, IndianRupee, Layers3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  aggregateUsage,
  formatInr,
  formatRoomTypeDate,
  type RoomTypeRecord,
} from '@/components/dashboard/room-types/admin-room-types-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminRoomTypesDetailPage({ record }: { record: RoomTypeRecord }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const usage = aggregateUsage(record);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-rt-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, record.id] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <motion.div data-rt-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/rooms/types" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Room Types
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Room Management / Room Types / <span className="font-medium text-foreground">{record.typeCode}</span>
        </p>
      </motion.div>

      <header data-rt-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">{record.name}</h1>
            <p className="text-sm text-muted-foreground">
              {record.typeCode} · {record.category}
            </p>
            <Badge variant="outline" className="mt-2 rounded-full">
              {record.status}
            </Badge>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{record.description}</p>
          </div>
          <div className="flex h-28 w-full max-w-[10rem] items-center justify-center rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_20%,var(--card))] text-xs text-muted-foreground">
            {record.imageUrl ? 'Room image' : 'Room image placeholder'}
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section data-rt-detail className="rounded-2xl border bg-card p-5" aria-labelledby="rt-cap-heading">
          <h2 id="rt-cap-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <Layers3 className="size-4" aria-hidden />
            Capacity &amp; configuration
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Max occupancy</dt>
              <dd className="font-semibold tabular-nums">{record.maxCapacity}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Number of beds</dt>
              <dd className="font-semibold tabular-nums">{record.bedCount}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Bed configuration</dt>
              <dd className="font-semibold">{record.bedConfiguration}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Rooms using this type</dt>
              <dd className="font-semibold tabular-nums">{record.totalRooms}</dd>
            </div>
          </dl>
        </section>

        <section data-rt-detail className="rounded-2xl border bg-card p-5" aria-labelledby="rt-price-heading">
          <h2 id="rt-price-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <IndianRupee className="size-4" aria-hidden />
            Pricing
          </h2>
          <p className="mt-3 text-2xl font-semibold tabular-nums">{formatInr(record.monthlyPriceInr)} / month</p>
          <p className="text-sm text-muted-foreground">
            Security deposit {record.securityDepositInr != null ? formatInr(record.securityDepositInr) : '—'}
          </p>
          {record.additionalChargesNote ? (
            <p className="mt-2 text-xs text-muted-foreground">{record.additionalChargesNote}</p>
          ) : null}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Pricing changes apply per effective policy; existing student allocations are not silently modified.
          </p>
        </section>

        <section data-rt-detail className="rounded-2xl border bg-card p-5 lg:col-span-2" aria-labelledby="rt-fac-heading">
          <h2 id="rt-fac-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <Sparkles className="size-4" aria-hidden />
            Facilities
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {record.facilities.map((f) => (
              <li key={f} className="rounded-full border px-3 py-1 text-xs font-medium text-[var(--nestora-forest)]">
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Bathroom: {record.bathroomType} · {record.hasAC ? 'AC' : 'Non-AC'}
          </p>
        </section>

        <section data-rt-detail className="rounded-2xl border bg-card p-5 lg:col-span-2" aria-labelledby="rt-usage-heading">
          <h2 id="rt-usage-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Room usage
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums">{usage.totalRooms}</p>
              <p className="text-xs text-muted-foreground">Total rooms</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums">{usage.totalBeds}</p>
              <p className="text-xs text-muted-foreground">Total beds</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-[#6d9773]">{usage.occupiedBeds}</p>
              <p className="text-xs text-muted-foreground">Occupied</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums">{usage.availableBeds}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 font-medium">Hostel</th>
                <th className="py-2 font-medium">Rooms</th>
                <th className="py-2 font-medium">Beds</th>
                <th className="py-2 font-medium">Occupied</th>
                <th className="py-2 font-medium">Available</th>
              </tr>
            </thead>
            <tbody>
              {record.hostelUsage.map((row) => (
                <tr key={row.hostel} className="border-b border-[var(--nestora-sage-muted)]/50">
                  <td className="py-2">{row.hostel}</td>
                  <td className="tabular-nums">{row.totalRooms}</td>
                  <td className="tabular-nums">{row.totalBeds}</td>
                  <td className="tabular-nums">{row.occupiedBeds}</td>
                  <td className="tabular-nums">{row.availableBeds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section data-rt-detail className="rounded-2xl border bg-card p-5 lg:col-span-2" aria-labelledby="rt-hist-heading">
          <h2 id="rt-hist-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            History
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Created by</dt>
              <dd>{record.createdBy}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatRoomTypeDate(record.createdDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd>{formatRoomTypeDate(record.lastUpdated)}</dd>
            </div>
          </dl>
          {record.history.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t pt-3">
              {record.history.map((h) => (
                <li key={h.id} className="text-xs text-muted-foreground">
                  {formatRoomTypeDate(h.date)} · {h.actor} — {h.change}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}
