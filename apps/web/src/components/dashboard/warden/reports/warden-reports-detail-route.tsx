'use client';

import { useMemo } from 'react';

import { AdminReportsDetailRoute } from '@/components/dashboard/reports/admin-reports-detail-route';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

export function WardenReportsDetailRoute({ reportId }: { reportId: string }) {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const previewParams = useMemo(() => {
    const hostel =
      hostelScope && hostelScope !== 'All Hostels' && hostelScope !== 'No hostel assigned' ? hostelScope : undefined;
    return { hostel, period: 'Last 30 days' as const };
  }, [hostelScope]);

  return (
    <AdminReportsDetailRoute reportId={reportId} listHref="/warden/reports" previewParams={previewParams} />
  );
}
