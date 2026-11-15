'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AllocationRecord } from '@/components/dashboard/allocation/admin-allocation-data';
import type { BedRecord } from '@/components/dashboard/beds/admin-beds-data';
import { fetchAllocationQueue } from '@/lib/api/allocations';
import { fetchBedDirectoryList } from '@/lib/api/beds';

export type AllocationAssignStudentOption = AllocationRecord;

export type AllocationAssignBedOption = {
  bedId: string;
  label: string;
  roomNumber: string;
  hostel: string;
};

function mapBedOption(bed: BedRecord): AllocationAssignBedOption {
  const label = `${bed.roomNumber} · Bed ${bed.bedNumber}`;
  return {
    bedId: bed.id,
    label,
    roomNumber: bed.roomNumber,
    hostel: bed.hostel,
  };
}

export function useAllocationAssignOptions(hostelName: string | undefined, enabled: boolean) {
  const [students, setStudents] = useState<AllocationAssignStudentOption[]>([]);
  const [beds, setBeds] = useState<AllocationAssignBedOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const hostelFilter = hostelName?.trim() && hostelName !== 'No hostel assigned' ? hostelName : undefined;
      const [queueRes, bedsRes] = await Promise.all([
        fetchAllocationQueue(),
        fetchBedDirectoryList({
          page: 1,
          limit: 200,
          hostel: hostelFilter,
          status: 'Available',
        }),
      ]);

      if (queueRes.error) {
        setError(queueRes.error);
      }
      if (bedsRes.error && !queueRes.error) {
        setError(bedsRes.error);
      }

      const eligible = (queueRes.queue ?? []).filter(
        (row) =>
          row.admissionStatus === 'Fully Approved' &&
          (row.status === 'Pending' || row.status === 'Change Requested'),
      );

      const scopedStudents = hostelFilter
        ? eligible.filter((row) => {
            const h = row.hostel ?? row.preferenceHostel;
            return h === hostelFilter;
          })
        : eligible;

      setStudents(scopedStudents);

      const rawBeds = bedsRes.beds ?? [];
      const scopedBeds = hostelFilter
        ? rawBeds.filter((b) => b.hostel === hostelFilter)
        : rawBeds;
      setBeds(scopedBeds.map(mapBedOption));
    } catch {
      setError('Unable to load allocation options.');
    } finally {
      setLoading(false);
    }
  }, [enabled, hostelName]);

  useEffect(() => {
    void load();
  }, [load]);

  return { students, beds, loading, error, refresh: load };
}