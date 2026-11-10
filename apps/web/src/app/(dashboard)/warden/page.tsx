import { WardenDashboardHome } from '@/components/dashboard/warden-dashboard-home';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Warden Dashboard',
  'Operational overview for hostel wardens.',
  '/warden',
);

export default function WardenDashboardPage() {
  return <WardenDashboardHome />;
}
