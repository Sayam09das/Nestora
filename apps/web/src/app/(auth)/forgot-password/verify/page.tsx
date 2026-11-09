import { Suspense } from 'react';

import { ForgotPasswordVerifyScreen } from '@/components/auth/password-reset-screens';

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <ForgotPasswordVerifyScreen />
    </Suspense>
  );
}

function VerifyFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-caption text-muted-foreground">
      Loading…
    </div>
  );
}
