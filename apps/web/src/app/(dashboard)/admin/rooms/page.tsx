import { AdminRoomsPage } from '@/components/dashboard/rooms/admin-rooms-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'All Rooms',
  'Manage hostel rooms, occupancy, availability, and assignments.',
  '/admin/rooms',
);

export default function AdminRoomsListPage() {
  return <AdminRoomsPage />;
}
