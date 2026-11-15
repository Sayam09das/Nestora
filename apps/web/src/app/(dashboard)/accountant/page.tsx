import { AccountantHomePage } from '@/components/dashboard/accountant-portal/accountant-home-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Accountant',
  'University fee overview and ledger access.',
  '/accountant',
);

export default function AccountantDashboardPage() {
  return <AccountantHomePage />;
}