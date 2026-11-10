import { AdminBedsPage } from '@/components/dashboard/beds/admin-beds-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Bed Inventory',
  'Track bed availability, occupancy, reservations, and maintenance across hostels.',
  '/admin/rooms/beds',
);

export default function AdminBedsListPage() {
  return <AdminBedsPage />;
}
