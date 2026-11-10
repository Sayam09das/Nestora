import { AdminStaffDetailPage } from '@/components/dashboard/staff/admin-staff-detail-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata(
    'Staff profile',
    'Personnel record, assignment, and HR documents.',
    `/admin/staff/${id}`,
  );
}

export default async function AdminStaffDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminStaffDetailPage userId={id} />;
}
