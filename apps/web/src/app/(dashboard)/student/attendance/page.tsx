import { StudentAttendancePage } from '@/components/dashboard/student-portal/attendance/student-attendance-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Attendance',
  'View your hostel attendance history and monthly standing.',
  '/student/attendance',
);

export default function StudentAttendanceRoute() {
  return <StudentAttendancePage />;
}