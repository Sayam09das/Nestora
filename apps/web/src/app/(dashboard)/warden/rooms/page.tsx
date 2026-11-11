import { WardenRoomsPage } from '@/components/dashboard/warden/rooms/warden-rooms-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Room & Bed Management',
  'Hostel-scoped bed matrix, vacancy heatmap, and allocation queue for wardens.',
  '/warden/rooms',
);

export default function WardenRoomsRoute() {
  return <WardenRoomsPage />;
}
