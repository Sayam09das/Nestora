import { WardenMaintenancePage } from '@/components/dashboard/warden/maintenance/warden-maintenance-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Maintenance Requests',
  'Work queue, repair tickets, and rooms on maintenance hold for wardens.',
  '/warden/maintenance',
);

export default function WardenMaintenanceRoute() {
  return <WardenMaintenancePage />;
}
