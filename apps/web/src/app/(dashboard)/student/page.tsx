import { StudentDashboardHome } from '@/components/dashboard/student-portal/student-dashboard-home';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Student Dashboard',
  'Your hostel overview — room, leave, and services.',
  '/student',
);

export default function StudentDashboardPage() {
  return <StudentDashboardHome />;
}
