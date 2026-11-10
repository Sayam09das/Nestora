import { notFound } from 'next/navigation';

import { AdminRoomsDetailPage } from '@/components/dashboard/rooms/admin-rooms-detail-page';
import { getRoomById } from '@/components/dashboard/rooms/admin-rooms-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const room = getRoomById(id);
  const title = room ? `Room ${room.roomNumber}` : 'Room details';
  const path = `/admin/rooms/${id}`;
  return createPrivatePageMetadata(title, `${title} — Nestora room management.`, path);
}

export default async function AdminRoomDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const room = getRoomById(id);
  if (!room) {
    notFound();
  }
  return <AdminRoomsDetailPage room={room} />;
}
