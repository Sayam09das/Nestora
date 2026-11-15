import { StudentVisitorsPage } from '@/components/dashboard/student-portal/visitors/student-visitors-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Visitor Requests',
  'Pre-register hostel visitors and track gate approval status.',
  '/student/visitors',
);

export default function StudentVisitorsRoute() {
  return <StudentVisitorsPage />;
}