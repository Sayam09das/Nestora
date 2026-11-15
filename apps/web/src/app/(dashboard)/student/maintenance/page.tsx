import { StudentMaintenancePage } from '@/components/dashboard/student-portal/maintenance/student-maintenance-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Maintenance Requests',
  'Submit and track hostel maintenance and facility tickets.',
  '/student/maintenance',
);

export default function StudentMaintenanceRoute() {
  return <StudentMaintenancePage />;
}