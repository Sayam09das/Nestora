import { GuardMovementsPage } from '@/components/dashboard/guard-portal/guard-movements-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Movement Log',
  'Gate movement history for security guards.',
  '/guard/movements',
);

export default function GuardMovementsRoute() {
  return <GuardMovementsPage />;
}