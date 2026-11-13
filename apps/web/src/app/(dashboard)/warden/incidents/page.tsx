import { WardenIncidentsPage } from '@/components/dashboard/warden/incidents/warden-incidents-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Incident Reports',
  'Emergency incident desk with acknowledgement, severity control, and resolution for wardens.',
  '/warden/incidents',
);

export default function WardenIncidentsRoute() {
  return <WardenIncidentsPage />;
}
