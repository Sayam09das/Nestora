'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthFlowShell } from '@/components/auth/auth-flow-shell';
import { AuthFieldInput, AuthOtpInput } from '@/components/auth/auth-form-fields';
import { AuthSkiperLink } from '@/components/auth/auth-skiper-link';
import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import {
  passwordResetStorage,
  requestPasswordReset,
  resetPasswordWithEmailLink,
  resetPasswordWithToken,
  verifyPasswordResetOtp,
} from '@/lib/api/auth-password';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

function MessageBanner({ tone, text }: { tone: 'info' | 'error' | 'success'; text: string }) {
  return (
    <motion.p
      role="status"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border px-3 py-2.5 text-caption leading-relaxed',
        tone === 'error' && 'border-destructive/30 bg-destructive/10 text-destructive',
        tone === 'success' &&
          'border-[color-mix(in_oklch,var(--primary)_35%,var(--border))] bg-[color-mix(in_srgb,var(--nestora-sage)_12%,var(--card))] text-[var(--nestora-forest)]',
        tone === 'info' && 'border-border bg-muted/50 text-muted-foreground',
      )}
    >
      {text}
    </motion.p>
  );
}

export function ForgotPasswordScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await requestPasswordReset(email.trim());
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(passwordResetStorage.emailKey, email.trim());
      }
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError('Unable to reach the server. Check NEXT_PUBLIC_API_URL and that the API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFlowShell
      stepIndex={0}
      title="Forgot password"
      description="Enter your institutional email. We will send a secure reset link and a one-time code if your campus enables it."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-caption font-semibold text-foreground"
          >
            Email address
          </label>
          <AuthFieldInput
            id="forgot-email"
            name="email"
            autoComplete="username"
            textType="email"
            placeholder="warden@university.edu"
            value={email}
            onChange={setEmail}
            leadingIcon={Mail}
          />
        </div>

        <AnimatePresence mode="wait">
          {error ? <MessageBanner key="err" tone="error" text={error} /> : null}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading}
          className={cn(
            nestoraPrimaryCtaClasses,
            'h-12 w-full justify-center gap-2 px-6 text-supporting',
          )}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
          whileHover={reduceMotion || loading ? undefined : { y: -1 }}
        >
          {loading ? 'Sending…' : 'Send reset instructions'}
          <ArrowRight className="size-4" aria-hidden />
        </motion.button>
      </form>
    </AuthFlowShell>
  );
}

export function ForgotPasswordVerifyScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = searchParams.get('email');
    const fromStore =
      typeof window !== 'undefined' ? sessionStorage.getItem(passwordResetStorage.emailKey) : null;
    const resolved = (fromQuery ?? fromStore ?? '').trim();
    setEmail(resolved);
    if (resolved) {
      setInfo(
        'We sent a secure reset link to your inbox. Enter the 6-digit code here if your campus uses it.',
      );
    }
  }, [searchParams]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 6) {
      setError('Enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const result = await verifyPasswordResetOtp(email, code);
      if (!result.success && result.message.includes('not available')) {
        setInfo(
          'Your campus uses the secure link in your email. Open that link to set a new password, or ask your housing admin for help.',
        );
        return;
      }
      if (result.data?.resetToken) {
        sessionStorage.setItem(passwordResetStorage.tokenKey, result.data.resetToken);
      }
      router.push('/forgot-password/reset');
    } catch {
      setError('Unable to verify the code. Try again or use the email link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFlowShell
      stepIndex={1}
      title="Verify reset code"
      description="Check your inbox for a 6-digit code, or use the secure link in the same email."
      backHref="/forgot-password"
      backLabel="Back"
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <p className="text-caption text-muted-foreground">
          Sending to <span className="font-semibold text-foreground">{email || 'your email'}</span>
        </p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: motionEase }}
        >
          <label
            htmlFor="otp-0"
            className="block text-center text-caption font-semibold text-foreground"
          >
            One-time code
          </label>
          <AuthOtpInput value={code} onChange={setCode} disabled={loading} />
        </motion.div>

        <AnimatePresence mode="wait">
          {error ? <MessageBanner key="e" tone="error" text={error} /> : null}
          {info ? <MessageBanner key="i" tone="info" text={info} /> : null}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading || !email}
          className={cn(
            nestoraPrimaryCtaClasses,
            'h-12 w-full justify-center gap-2 px-6 text-supporting',
          )}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        >
          {loading ? 'Verifying…' : 'Verify and continue'}
          <ArrowRight className="size-4" aria-hidden />
        </motion.button>

        <p className="text-center text-caption text-muted-foreground">
          Prefer the email link?{' '}
          <AuthSkiperLink
            href="/forgot-password/reset"
            className="font-semibold text-[var(--nestora-forest)]"
          >
            Set password from link
          </AuthSkiperLink>
        </p>
      </form>
    </AuthFlowShell>
  );
}

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const linkToken = searchParams.get('token')?.trim() ?? '';
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setEmail(sessionStorage.getItem(passwordResetStorage.emailKey) ?? '');
    setResetToken(sessionStorage.getItem(passwordResetStorage.tokenKey) ?? '');
  }, []);

  const usingEmailLink = linkToken.length >= 64;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = usingEmailLink
        ? await resetPasswordWithEmailLink({
            token: linkToken,
            newPassword: password,
            newPasswordConfirm: confirm,
          })
        : await resetPasswordWithToken({
            email,
            resetToken,
            newPassword: password,
            newPasswordConfirm: confirm,
          });
      if (!result.success && result.message.includes('not available') && !usingEmailLink) {
        setError('Use the secure reset link from your email to continue.');
        setLoading(false);
        return;
      }
      setSuccess(result.message || 'Password updated. You can sign in.');
      sessionStorage.removeItem(passwordResetStorage.emailKey);
      sessionStorage.removeItem(passwordResetStorage.tokenKey);
      setTimeout(() => router.push('/login'), 1200);
    } catch {
      setError('Unable to reach the server. Try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFlowShell
      stepIndex={2}
      title="Create new password"
      description={
        usingEmailLink
          ? 'Choose a strong password for your Nestora account. This link works once.'
          : 'Choose a strong password. You will need at least 12 characters.'
      }
      backHref="/forgot-password/verify"
      backLabel="Back"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {usingEmailLink ? (
          <p className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-caption text-muted-foreground">
            <KeyRound className="size-4 shrink-0 text-primary" aria-hidden />
            Secure email link detected
          </p>
        ) : null}

        <div>
          <label
            htmlFor="new-password"
            className="block text-caption font-semibold text-foreground"
          >
            New password
          </label>
          <AuthFieldInput
            id="new-password"
            name="new-password"
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
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-caption font-semibold text-foreground"
          >
            Confirm password
          </label>
          <AuthFieldInput
            id="confirm-password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={setConfirm}
            leadingIcon={Lock}
            revealable
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((v) => !v)}
            labelShow="Show password"
            labelHide="Hide password"
          />
        </div>

        <AnimatePresence mode="wait">
          {error ? <MessageBanner key="e" tone="error" text={error} /> : null}
          {success ? <MessageBanner key="s" tone="success" text={success} /> : null}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading}
          className={cn(
            nestoraPrimaryCtaClasses,
            'h-12 w-full justify-center gap-2 px-6 text-supporting',
          )}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        >
          {loading ? 'Saving…' : 'Update password'}
          <ArrowRight className="size-4" aria-hidden />
        </motion.button>

        {!success ? (
          <p className="text-center text-caption text-muted-foreground">
            <Link
              href="/login"
              className="font-semibold text-[var(--nestora-forest)] hover:underline"
            >
              Return to sign in
            </Link>
          </p>
        ) : null}
      </form>
    </AuthFlowShell>
  );
}
