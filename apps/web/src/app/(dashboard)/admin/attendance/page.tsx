import { AdminAttendancePage } from '@/components/dashboard/attendance/admin-attendance-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Attendance',
  'Record nightly hostel attendance, bulk floor roll call, and review session history.',
  '/admin/attendance',
);

export default function AdminAttendanceListPage() {
  return <AdminAttendancePage />;
}
