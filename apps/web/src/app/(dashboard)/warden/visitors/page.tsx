import { WardenVisitorsPage } from '@/components/dashboard/warden/visitors/warden-visitors-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Visitor Management',
  'Live visitor approvals, gate check-in/out, and registration for wardens.',
  '/warden/visitors',
);

export default function WardenVisitorsRoute() {
  return <WardenVisitorsPage />;
}
