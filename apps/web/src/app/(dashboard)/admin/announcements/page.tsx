import { AdminAnnouncementsPage } from '@/components/dashboard/announcements/admin-announcements-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Announcements',
  'Publish notices, track acknowledgements, and manage scoped hostel circulars.',
  '/admin/announcements',
);

export default function AdminAnnouncementsListPage() {
  return <AdminAnnouncementsPage />;
}
