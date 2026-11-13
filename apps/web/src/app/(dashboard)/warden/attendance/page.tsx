import { WardenAttendancePage } from '@/components/dashboard/warden/attendance/warden-attendance-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Attendance',
  'Hostel-scoped night roll call with live roster marks and session history for wardens.',
  '/warden/attendance',
);

export default function WardenAttendanceRoute() {
  return <WardenAttendancePage />;
}
