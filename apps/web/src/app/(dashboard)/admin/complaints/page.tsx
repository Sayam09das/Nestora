import { AdminComplaintsPage } from '@/components/dashboard/complaints/admin-complaints-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Complaints & Maintenance',
  'Review maintenance tickets, assign staff, and track SLA-backed resolution.',
  '/admin/complaints',
);

export default function AdminComplaintsListPage() {
  return <AdminComplaintsPage />;
}
