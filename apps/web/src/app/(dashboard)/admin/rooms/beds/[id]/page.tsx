import { AdminBedDetailPage } from '@/components/dashboard/beds/admin-bed-detail-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Bed details', 'Bed inventory and assignment record.', `/admin/rooms/beds/${id}`);
}

export default async function AdminBedDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminBedDetailPage bedId={id} />;
}
