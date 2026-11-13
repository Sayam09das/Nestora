import { WardenAnnouncementsPage } from '@/components/dashboard/warden/announcements/warden-announcements-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Announcements',
  'Hostel-scoped notices, acknowledgements, and broadcast publishing for wardens.',
  '/warden/announcements',
);

export default function WardenAnnouncementsRoute() {
  return <WardenAnnouncementsPage />;
}
