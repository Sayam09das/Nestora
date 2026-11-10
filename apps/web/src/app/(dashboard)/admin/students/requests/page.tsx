import { AdminStudentRequestsPage } from '@/components/dashboard/students/admin-student-requests-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Student Requests',
  'Review, approve, or reject student-submitted hostel and accommodation requests.',
  '/admin/students/requests',
);

export default function AdminStudentRequestsRoutePage() {
  return <AdminStudentRequestsPage />;
}
