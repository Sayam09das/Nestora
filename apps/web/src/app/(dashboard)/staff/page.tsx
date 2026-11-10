import { StaffDashboardHome } from '@/components/dashboard/staff-dashboard-home';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Staff Dashboard',
  'Duty and ticket overview for hostel staff.',
  '/staff',
);

export default function StaffDashboardPage() {
  return <StaffDashboardHome />;
}
