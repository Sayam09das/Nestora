import { AdminFeesPage } from '@/components/dashboard/fees/admin-fees-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Fees & Payments',
  'Hostel fee schedules, student ledgers, and offline payment recording.',
  '/accountant/fees',
);

export default function AccountantFeesListPage() {
  return <AdminFeesPage />;
}