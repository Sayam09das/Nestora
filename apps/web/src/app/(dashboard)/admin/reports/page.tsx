import { AdminReportsPage } from '@/components/dashboard/reports/admin-reports-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Reports & Analytics',
  'Run operational reports, preview KPIs, and schedule exports across hostels.',
  '/admin/reports',
);

export default function AdminReportsListPage() {
  return <AdminReportsPage />;
}
