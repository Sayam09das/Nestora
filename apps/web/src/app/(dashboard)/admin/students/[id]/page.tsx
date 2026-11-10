import { AdminStudentDetailPage } from '@/components/dashboard/students/admin-student-detail-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata(
    'Student profile',
    'Resident student account, housing, and academic record.',
    `/admin/students/${id}`,
  );
}

export default async function AdminStudentDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminStudentDetailPage userId={id} />;
}
