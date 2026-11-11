import { StudentProfilePage } from '@/components/dashboard/student-portal/profile/student-profile-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Profile',
  'Your personal, academic, and hostel profile.',
  '/student/profile',
);

export default function StudentProfileRoute() {
  return <StudentProfilePage />;
}
