import { AdminStaffPage } from '@/components/dashboard/staff/admin-staff-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Wardens',
  'View and manage hostel warden assignments and roster status.',
  '/admin/staff/wardens',
);

export default function AdminWardensListPage() {
  return <AdminStaffPage pageVariant="wardens" />;
}
