import { WardenStudentDetailPage } from '@/components/dashboard/warden/students/warden-student-detail-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata(
    'Student profile',
    'Resident details and room allocation in your assigned hostel.',
    `/warden/students/${id}`,
  );
}

export default async function WardenStudentDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <WardenStudentDetailPage userId={id} />;
}
