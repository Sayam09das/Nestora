import { StudentOutingsPage } from '@/components/dashboard/student-portal/outings/student-outings-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata('Outings', 'Request same-day hostel outings.', '/student/outings');

export default function StudentOutingsRoutePage() {
  return <StudentOutingsPage />;
}