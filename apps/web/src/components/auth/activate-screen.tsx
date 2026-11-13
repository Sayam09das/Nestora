'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthFlowShell } from '@/components/auth/auth-flow-shell';
import { AuthFieldInput } from '@/components/auth/auth-form-fields';
import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { activateAccount } from '@/lib/api/auth';
import { isApiConfigured } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export function ActivateAccountScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isApiConfigured()) {
      setError('API URL is not configured. Set NEXT_PUBLIC_API_URL in apps/web/.env.local.');
      return;
    }
    if (tokenFromUrl.length < 64) {
      setError('Activation link is invalid or expired. Request a new link from your administrator.');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await activateAccount({
        token: tokenFromUrl,
        password,
        passwordConfirm: confirm,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess(result.message || 'Account activated. You can sign in.');
      setTimeout(() => router.push('/login'), 1500);
    } catch {
      setError('Unable to reach the API. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFlowShell
      stepIndex={0}
      title="Activate your account"
      description="Set a strong password to finish provisioning. This link works once."
      backHref="/login"
      backLabel="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-caption text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
          {tokenFromUrl ? 'Secure activation link detected' : 'Open the link from your invitation email'}
        </p>

        <motion.div initial={false} animate={{ opacity: 1 }}>
          <label htmlFor="activate-password" className="block text-caption font-semibold text-foreground">
            New password
          </label>
          <AuthFieldInput
            id="activate-password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 12 characters"
            value={password}
            onChange={setPassword}
            leadingIcon={Lock}
            revealable
            visible={showPassword}
            onToggleVisible={() => setShowPassword((v) => !v)}
            labelShow="Show password"
            labelHide="Hide password"
          />
        </motion.div>

        <div>
          <label htmlFor="activate-confirm" className="block text-caption font-semibold text-foreground">
            Confirm password
          </label>
          <AuthFieldInput
            id="activate-confirm"
            name="passwordConfirm"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={setPasswordConfirm}
            leadingIcon={Lock}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-caption text-[var(--nestora-forest)]">
            {success}
          </p>
        ) : null}

        <motion.button
          type="submit"
          disabled={loading || !tokenFromUrl}
          className={cn(nestoraPrimaryCtaClasses, 'h-12 w-full justify-center gap-2 px-6 text-supporting')}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        >
          {loading ? 'Activating…' : 'Activate and continue'}
          <ArrowRight className="size-4" aria-hidden />
        </motion.button>
      </form>
    </AuthFlowShell>
  );
}
