import { Suspense } from 'react';
import { ActivateAccountScreen } from '@/components/auth/activate-screen';

export default function ActivatePage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading…</p>}>
      <ActivateAccountScreen />
    </Suspense>
  );
}

