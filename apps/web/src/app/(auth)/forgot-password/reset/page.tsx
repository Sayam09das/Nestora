import { Suspense } from 'react';

import { ResetPasswordScreen } from '@/components/auth/password-reset-screens';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <ResetPasswordScreen />
    </Suspense>
  );
}

function ResetFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-caption text-muted-foreground">
      Loading…
    </div>
  );
}
