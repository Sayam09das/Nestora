import { AdminHostelsPage } from '@/components/dashboard/hostels/admin-hostels-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Hostel Management',
  'Manage university hostels, buildings, gender categories, and campus bed capacity.',
  '/admin/hostels',
);

export default function AdminHostelsListPage() {
  return <AdminHostelsPage />;
}
