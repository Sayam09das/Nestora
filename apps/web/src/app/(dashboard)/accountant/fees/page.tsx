import { AdminFeesPage } from '@/components/dashboard/fees/admin-fees-page';
import { ACCOUNTANT_FINANCE_DESK } from '@/components/dashboard/fees/finance-desk-config';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Fees & Payments',
  'Hostel fee schedules, student ledgers, and offline payment recording.',
  '/accountant/fees',
);

export default function AccountantFeesListPage() {
  return <AdminFeesPage desk={ACCOUNTANT_FINANCE_DESK} />;
}