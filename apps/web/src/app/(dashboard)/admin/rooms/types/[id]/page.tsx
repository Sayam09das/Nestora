import { notFound } from 'next/navigation';

import { AdminRoomTypesDetailPage } from '@/components/dashboard/room-types/admin-room-types-detail-page';
import { getRoomTypeById } from '@/components/dashboard/room-types/admin-room-types-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getRoomTypeById(id);
  const title = record ? record.name : 'Room type';
  return createPrivatePageMetadata(title, `${title} — Nestora room types.`, `/admin/rooms/types/${id}`);
}

export default async function AdminRoomTypeDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getRoomTypeById(id);
  if (!record) notFound();
  return <AdminRoomTypesDetailPage record={record} />;
}
