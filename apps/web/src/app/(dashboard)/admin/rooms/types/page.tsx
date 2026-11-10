import { AdminRoomTypesPage } from '@/components/dashboard/room-types/admin-room-types-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Room Types',
  'Manage hostel room categories, capacity, facilities, and pricing.',
  '/admin/rooms/types',
);

export default function AdminRoomTypesListPage() {
  return <AdminRoomTypesPage />;
}
