import { WardenOutingsPage } from '@/components/dashboard/warden/outings/warden-outings-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Outings',
  'Review and approve student outing requests.',
  '/warden/outings',
);

export default function WardenOutingsRoutePage() {
  return <WardenOutingsPage />;
}