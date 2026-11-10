import { AdminStaffNewPage } from '@/components/dashboard/staff/admin-staff-new-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Add Staff Member',
  'Onboard a new staff or warden into the Nestora admin directory.',
  '/admin/staff/new',
);

export default function AdminStaffNewRoutePage() {
  return <AdminStaffNewPage />;
}
