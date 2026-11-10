import { notFound } from 'next/navigation';

import { AdminBedsDetailPage } from '@/components/dashboard/beds/admin-beds-detail-page';
import { getBedById } from '@/components/dashboard/beds/admin-beds-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const bed = getBedById(id);
  const title = bed ? bed.bedId : 'Bed details';
  const path = `/admin/rooms/beds/${id}`;
  return createPrivatePageMetadata(title, `${title} — Nestora bed inventory.`, path);
}

export default async function AdminBedDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const bed = getBedById(id);
  if (!bed) {
    notFound();
  }
  return <AdminBedsDetailPage bed={bed} />;
}
