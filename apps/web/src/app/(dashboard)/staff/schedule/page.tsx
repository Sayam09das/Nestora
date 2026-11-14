import { StaffSchedulePage } from '@/components/dashboard/staff-portal/schedule/staff-schedule-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Schedule',
  'Duty roster and shift windows for hostel staff.',
  '/staff/schedule',
);

export default function StaffScheduleRoute() {
  return <StaffSchedulePage />;
}