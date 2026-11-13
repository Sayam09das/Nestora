'use client';

import { ArrowRight, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthFlowShell } from '@/components/auth/auth-flow-shell';
import { AuthFieldInput } from '@/components/auth/auth-form-fields';
import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { changePassword, fetchCurrentUser, postLoginRedirect } from '@/lib/api/auth';
import { isApiConfigured } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!isApiConfigured()) {
        setError('API URL is not configured.');
        setBooting(false);
        return;
      }
      const { user, error: meError } = await fetchCurrentUser();
      if (!active) return;
      if (meError || !user) {
        router.replace('/login');
        return;
      }
      if (!user.mustChangePassword) {
        router.replace(user.dashboardPath || '/admin');
        return;
      }
      setBooting(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm: confirm,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const { user } = await fetchCurrentUser();
      router.push(user ? postLoginRedirect(user) : '/login');
    } catch {
      setError('Unable to reach the API.');
    } finally {
      setLoading(false);
    }
  };

  if (booting) {
    return (
      <AuthFlowShell
        stepIndex={0}
        title="Change password"
        description="Loading your session…"
        backHref="/login"
      >
        <p className="text-caption text-muted-foreground">Please wait.</p>
      </AuthFlowShell>
    );
  }

  return (
    <AuthFlowShell
      stepIndex={0}
      title="Change your password"
      description="Your administrator assigned a temporary password. Set a new one before continuing."
      backHref="/login"
      backLabel="Sign out and return"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="current-password" className="block text-caption font-semibold text-foreground">
            Current password
          </label>
          <AuthFieldInput
            id="current-password"
            name="currentPassword"
            autoComplete="current-password"
            placeholder="Temporary or current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            leadingIcon={Lock}
            revealable
            visible={showCurrent}
            onToggleVisible={() => setShowCurrent((v) => !v)}
          />
        </div>

        <div>
          <label htmlFor="new-password" className="block text-caption font-semibold text-foreground">
            New password
          </label>
          <AuthFieldInput
            id="new-password"
            name="newPassword"
            autoComplete="new-password"
            placeholder="At least 12 characters"
            value={newPassword}
            onChange={setNewPassword}
            leadingIcon={Lock}
            revealable
            visible={showNew}
            onToggleVisible={() => setShowNew((v) => !v)}
          />
        </div>

        <div>
          <label htmlFor="new-password-confirm" className="block text-caption font-semibold text-foreground">
            Confirm new password
          </label>
          <AuthFieldInput
            id="new-password-confirm"
            name="newPasswordConfirm"
            autoComplete="new-password"
            placeholder="Repeat new password"
            value={confirm}
            onChange={setConfirm}
            leadingIcon={Lock}
            revealable
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((v) => !v)}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={cn(nestoraPrimaryCtaClasses, 'h-12 w-full justify-center gap-2 px-6 text-supporting')}
        >
          {loading ? 'Updating…' : 'Update password'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>
    </AuthFlowShell>
  );
}
