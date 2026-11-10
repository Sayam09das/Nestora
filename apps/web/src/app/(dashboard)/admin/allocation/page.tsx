import { AdminAllocationPage } from '@/components/dashboard/allocation/admin-allocation-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Room Allocation',
  'Assign beds to approved students, manage room changes, and track allocation history.',
  '/admin/allocation',
);

export default function AdminAllocationListPage() {
  return <AdminAllocationPage />;
}
