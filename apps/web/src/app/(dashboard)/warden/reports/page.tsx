import { WardenReportsPage } from '@/components/dashboard/warden/reports/warden-reports-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Reports & Analytics',
  'Hostel-scoped operational reports with live previews for wardens.',
  '/warden/reports',
);

export default function WardenReportsRoute() {
  return <WardenReportsPage />;
}
