import { WardenLeavePage } from '@/components/dashboard/warden/leave/warden-leave-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Leave Requests',
  'Hostel-scoped leave queue, approvals, and gate pass registry for wardens.',
  '/warden/leave',
);

export default function WardenLeaveRoute() {
  return <WardenLeavePage />;
}
