import { StudentLeavePage } from '@/components/dashboard/student-portal/leave/student-leave-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Leave Requests',
  'Apply for hostel leave and track warden approval status.',
  '/student/leave',
);

export default function StudentLeaveRoute() {
  return <StudentLeavePage />;
}