'use client';

import { useMemo } from 'react';

import { AdminSettingsDetailRoute } from '@/components/dashboard/settings/admin-settings-detail-route';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

export function WardenSettingsDetailRoute({ panelId }: { panelId: string }) {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope = useMemo(
    () => hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : undefined),
    [hostelApiFilter, hostelDisplay],
  );

  return (
    <AdminSettingsDetailRoute panelId={panelId} listHref="/warden/settings" hostel={hostelScope} />
  );
}
