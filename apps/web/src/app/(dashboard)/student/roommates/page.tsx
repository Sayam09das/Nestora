import { StudentRoommatesPage } from '@/components/dashboard/student-portal/roommates/student-roommates-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Roommates',
  'View roommates in your hostel room and shared room details.',
  '/student/roommates',
);

export default function StudentRoommatesRoute() {
  return <StudentRoommatesPage />;
}
