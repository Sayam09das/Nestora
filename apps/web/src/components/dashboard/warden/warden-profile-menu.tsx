'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchCurrentUser, logout } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'WD';
}

type Props = { className?: string };

export function WardenProfileMenu({ className }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState('Hostel Warden');
  const [profileEmail, setProfileEmail] = useState('warden@university.edu');
  const initials = getInitials(profileName);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = () => {
      void fetchCurrentUser().then(({ user }) => {
        if (cancelled || !user) return;
        setProfileName(`${user.firstName} ${user.lastName}`.trim() || 'Warden');
        setProfileEmail(user.email);
      });
    };
    loadProfile();
    const interval = window.setInterval(loadProfile, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadProfile();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useGSAP(
    () => {
      if (reduceMotion || !open || !cardRef.current) return;
      gsap.from(cardRef.current.querySelector('[data-warden-profile-shine]'), {
        scaleX: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
      });
    },
    { scope: cardRef, dependencies: [open, reduceMotion] },
  );

  const handleLogout = useCallback(async () => {
    setOpen(false);
    await logout();
    router.push('/login');
  }, [router]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-9 max-w-[11rem] items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)] bg-card pl-1 pr-2.5 text-left',
          'transition-[border-color,box-shadow] hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:shadow-sm',
          focusRing,
          className,
        )}
        aria-label="Profile menu"
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-[10px] font-bold text-white ring-2 ring-[color-mix(in_oklch,var(--nestora-gold)_45%,transparent)]"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden min-w-0 truncate text-caption font-semibold text-foreground sm:block">
          {profileName.split(' ')[0] ?? 'Warden'}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(100vw-2rem,18.5rem)] overflow-hidden rounded-2xl border p-0">
        <motion.div
          ref={cardRef}
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={open ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.28, ease: motionEase }}
          className="relative overflow-hidden bg-[linear-gradient(165deg,var(--nestora-forest)_0%,#0a3428_100%)] px-4 pb-4 pt-3 text-white"
        >
          <div
            data-warden-profile-shine
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--nestora-gold)_55%,transparent)]"
            aria-hidden
          />
          <p className="truncate text-sm font-semibold">{profileName}</p>
          <p className="mt-1 truncate text-[11px] text-white/75">{profileEmail}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]">
            <ShieldCheck className="size-3 text-[var(--nestora-gold)]" aria-hidden />
            Warden
          </span>
        </motion.div>

        <div className="bg-card p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => {
                setOpen(false);
                router.push('/warden');
              }}
            >
              <LayoutDashboard className="size-4 text-[var(--nestora-sage)]" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => {
                setOpen(false);
                router.push('/warden/profile');
              }}
            >
              <UserRound className="size-4 text-[var(--nestora-sage)]" />
              My profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => {
                setOpen(false);
                router.push('/warden/settings');
              }}
            >
              <Settings className="size-4 text-[var(--nestora-sage)]" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => {
                setOpen(false);
                router.push('/change-password');
              }}
            >
              <ShieldCheck className="size-4 text-[var(--nestora-gold)]" />
              Change password
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" className="rounded-lg" onClick={() => void handleLogout()}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
