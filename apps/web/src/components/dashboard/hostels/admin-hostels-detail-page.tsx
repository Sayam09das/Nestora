'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Building, Layers3, MapPin, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  formatHostelDate,
  hostelOccupancyPct,
  type HostelRecord,
} from '@/components/dashboard/hostels/admin-hostels-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminHostelsDetailPage({ record }: { record: HostelRecord }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const occupancy = hostelOccupancyPct(record);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-hostel-detail]'), {
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
      <motion.div data-hostel-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/hostels" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Hostels
        </Button>
        <p className="text-xs text-muted-foreground">
          Dashboard / Hostel Management / <span className="font-medium text-foreground">{record.hostelCode}</span>
        </p>
      </motion.div>

      <header data-hostel-detail className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="h-32 bg-[linear-gradient(120deg,color-mix(in_oklch,var(--nestora-forest)_22%,var(--card)),color-mix(in_oklch,var(--nestora-sage)_18%,var(--card)))]" aria-hidden />
        <div className="relative px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-card bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] shadow-md">
              <Building className="size-9 text-[var(--nestora-forest)]" aria-hidden />
            </div>
            <Badge variant="outline" className="w-fit rounded-full">
              {record.status}
            </Badge>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[var(--nestora-forest)]">{record.name}</h1>
          <p className="text-sm text-muted-foreground">
            {record.hostelCode} · {record.genderCategory}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{record.description}</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section data-hostel-detail className="rounded-2xl border bg-card p-5" aria-labelledby="hostel-loc-heading">
          <h2 id="hostel-loc-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <MapPin className="size-4" aria-hidden />
            Location &amp; contact
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Campus zone</dt>
              <dd className="font-medium">{record.campusZone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd>{record.address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Contact phone</dt>
              <dd>{record.contactPhone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Established</dt>
              <dd className="tabular-nums">{record.yearEstablished}</dd>
            </div>
          </dl>
        </section>

        <section data-hostel-detail className="rounded-2xl border bg-card p-5" aria-labelledby="hostel-warden-heading">
          <h2 id="hostel-warden-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <Shield className="size-4" aria-hidden />
            Assigned warden
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Warden</dt>
              <dd className="font-medium">{record.wardenName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{record.wardenEmail}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-muted/20 p-3 text-[11px] text-muted-foreground">
            Wardens cannot access unassigned hostels (FR-019). Reassignment updates operational scope only.
          </p>
        </section>
      </div>

      <section data-hostel-detail className="rounded-2xl border bg-card p-5" aria-labelledby="hostel-infra-heading">
        <h2 id="hostel-infra-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
          <Layers3 className="size-4" aria-hidden />
          Infrastructure hierarchy
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <div>
            <dt className="text-muted-foreground">Buildings</dt>
            <dd className="text-lg font-semibold tabular-nums">{record.totalBuildings}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Blocks</dt>
            <dd className="text-lg font-semibold tabular-nums">{record.totalBlocks}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Floors</dt>
            <dd className="text-lg font-semibold tabular-nums">{record.totalFloors}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rooms</dt>
            <dd className="text-lg font-semibold tabular-nums">{record.totalRooms}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Beds</dt>
            <dd className="text-lg font-semibold tabular-nums">{record.totalBeds}</dd>
          </div>
        </dl>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-medium">Building</th>
                <th className="py-2 font-medium">Blocks</th>
                <th className="py-2 font-medium">Floors</th>
                <th className="py-2 font-medium">Rooms</th>
              </tr>
            </thead>
            <tbody>
              {record.buildings.map((b) => (
                <tr key={b.name} className="border-b border-[var(--nestora-sage-muted)]/50">
                  <td className="py-2">{b.name}</td>
                  <td className="py-2 tabular-nums">{b.blocks}</td>
                  <td className="py-2 tabular-nums">{b.floors}</td>
                  <td className="py-2 tabular-nums">{b.rooms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section data-hostel-detail className="rounded-2xl border bg-card p-5" aria-labelledby="hostel-occ-heading">
          <h2 id="hostel-occ-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <Users className="size-4" aria-hidden />
            Occupancy &amp; beds
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Occupied beds</dt>
              <dd className="font-semibold tabular-nums">{record.occupiedBeds}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Available beds</dt>
              <dd className="font-semibold tabular-nums">{record.availableBeds}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Occupancy rate</dt>
              <dd className="font-semibold tabular-nums">{record.totalBeds ? `${occupancy}%` : '—'}</dd>
            </div>
          </dl>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
            <div className="h-full rounded-full bg-[#6d9773]" style={{ width: `${Math.min(occupancy, 100)}%` }} />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Counts refresh when rooms or beds are created, updated, or reassigned (illustrative sample).
          </p>
        </section>

        <section data-hostel-detail className="rounded-2xl border bg-card p-5" aria-labelledby="hostel-fac-heading">
          <h2 id="hostel-fac-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Facilities
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {record.facilities.map((f) => (
              <li key={f}>
                <Badge variant="secondary" className="rounded-full font-normal">
                  {f}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section data-hostel-detail className="rounded-2xl border bg-card p-5" aria-labelledby="hostel-hist-heading">
        <h2 id="hostel-hist-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
          History
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Created by</dt>
            <dd>{record.createdBy}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatHostelDate(record.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last updated</dt>
            <dd>{formatHostelDate(record.updatedAt)}</dd>
          </div>
        </dl>
        <ul className="mt-4 space-y-2 border-t border-[var(--nestora-sage-muted)]/60 pt-4 text-sm">
          {record.modificationHistory.map((h) => (
            <li key={`${h.date}-${h.note}`} className="flex flex-wrap gap-x-2 text-muted-foreground">
              <span className="tabular-nums text-foreground">{h.date}</span>
              <span>·</span>
              <span>{h.user}</span>
              <span>—</span>
              <span>{h.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
