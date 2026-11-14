import { StaffAttendancePage } from '@/components/dashboard/staff-portal/attendance/staff-attendance-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Attendance & Shifts',
  'Duty attendance, shift windows, and hostel student counts for staff.',
  '/staff/attendance',
);

export default function StaffAttendanceRoute() {
  return <StaffAttendancePage />;
}