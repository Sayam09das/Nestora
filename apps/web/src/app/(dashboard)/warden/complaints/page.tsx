import { WardenComplaintsPage } from '@/components/dashboard/warden/complaints/warden-complaints-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Complaints & Issues',
  'Hostel-scoped maintenance tickets, assignments, and SLA tracking for wardens.',
  '/warden/complaints',
);

export default function WardenComplaintsRoute() {
  return <WardenComplaintsPage />;
}
