import { WardenEventsPage } from '@/components/dashboard/warden/events/warden-events-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Events & Activities',
  'Hostel and university-wide events calendar with live notices and acknowledgements.',
  '/warden/events',
);

export default function WardenEventsRoute() {
  return <WardenEventsPage />;
}
