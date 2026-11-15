import { StudentEventsPage } from '@/components/dashboard/student-portal/events/student-events-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Events & Activities',
  'Upcoming hostel events, activities, and registrations from live notices.',
  '/student/events',
);

export default function StudentEventsRoute() {
  return <StudentEventsPage />;
}