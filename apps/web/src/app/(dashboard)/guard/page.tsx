import { GuardGateConsolePage } from '@/components/dashboard/guard-portal/guard-gate-console-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Gate Console',
  'Security guard gate pass scan, exit, and return recording.',
  '/guard',
);

export default function GuardDashboardRoute() {
  return <GuardGateConsolePage />;
}