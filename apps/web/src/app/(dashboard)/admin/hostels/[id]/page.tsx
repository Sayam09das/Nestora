import { AdminHostelDetailPage } from '@/components/dashboard/hostels/admin-hostel-detail-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Hostel details', 'Hostel profile, capacity, and warden.', `/admin/hostels/${id}`);
}

export default async function AdminHostelDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminHostelDetailPage hostelId={id} />;
}
