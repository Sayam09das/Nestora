import { WardenDailyRegisterPage } from '@/components/dashboard/warden/register/warden-daily-register-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Daily Register',
  'Hostel-scoped chronological log of attendance, movements, visitors, and desk events.',
  '/warden/register',
);

export default function WardenDailyRegisterRoute() {
  return <WardenDailyRegisterPage />;
}
