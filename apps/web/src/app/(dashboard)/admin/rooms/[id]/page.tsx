import { AdminRoomDetailPage } from '@/components/dashboard/rooms/admin-room-detail-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Room details', 'Hostel room occupancy, residents, and facilities.', `/admin/rooms/${id}`);
}

export default async function AdminRoomDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminRoomDetailPage roomId={id} />;
}
