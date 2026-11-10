import { AdminStaffPage } from '@/components/dashboard/staff/admin-staff-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'All Staff',
  'Search, filter, and manage hostel staff and wardens.',
  '/admin/staff',
);

export default function AdminStaffListPage() {
  return <AdminStaffPage />;
}
