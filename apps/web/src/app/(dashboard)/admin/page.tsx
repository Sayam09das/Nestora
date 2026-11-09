import { AdminDashboardHome } from '@/components/dashboard/admin-dashboard-home';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Dashboard',
  'Hostel operations overview for university administrators.',
  '/admin',
);

export default function AdminHomePage() {
  return <AdminDashboardHome />;
}
