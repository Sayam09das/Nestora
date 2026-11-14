import { StaffAssignedTasksPage } from '@/components/dashboard/staff-portal/tasks/staff-assigned-tasks-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Assigned Tasks',
  'Live maintenance tickets and duty items assigned to you.',
  '/staff/tasks',
);

export default function StaffTasksPage() {
  return <StaffAssignedTasksPage />;
}