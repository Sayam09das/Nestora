'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  BedDouble,
  CalendarDays,
  CreditCard,
  KeyRound,
  LogOut,
  Settings,
  UserCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { className?: string };

export function StudentProfileMenu({ className }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { displayName, initials, studentId, hostelName, roomLabel } = useStudentShell();

  useGSAP(
    () => {
      if (reduceMotion || !open || !cardRef.current) return;
      gsap.from(cardRef.current.querySelector('[data-student-profile-shine]'), {
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
          'inline-flex h-9 max-w-[13rem] items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)] bg-card pl-1 pr-2.5 text-left',
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
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-[11px] font-semibold leading-tight text-foreground">
            {displayName.split(' ')[0] ?? 'Student'}
          </span>
          <span className="block truncate text-[10px] leading-tight text-muted-foreground">Student</span>
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(100vw-2rem,19rem)] overflow-hidden rounded-2xl border p-0">
        <motion.div
          ref={cardRef}
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={open ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.28, ease: motionEase }}
          className="relative overflow-hidden bg-[linear-gradient(165deg,var(--nestora-forest)_0%,#0a3428_100%)] px-4 pb-4 pt-3 text-white"
        >
          <motion.div
            data-student-profile-shine
            className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,var(--nestora-gold),var(--nestora-sage))]"
            aria-hidden
          />
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-white/70">{studentId}</p>
              <p className="truncate text-[10px] text-white/50">
                {hostelName} · {roomLabel}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem className="rounded-lg" onClick={() => { setOpen(false); router.push('/student/profile'); }}>
              <UserCircle className="size-4 text-[var(--nestora-sage)]" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg" onClick={() => { setOpen(false); router.push('/student/room'); }}>
              <BedDouble className="size-4 text-[var(--nestora-gold)]" />
              My Room Details
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg" onClick={() => { setOpen(false); router.push('/student/leave'); }}>
              <CalendarDays className="size-4 text-[var(--nestora-forest)]" />
              My Leave History
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg" onClick={() => { setOpen(false); router.push('/student/fees'); }}>
              <CreditCard className="size-4" />
              Fee &amp; Payments
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg" onClick={() => { setOpen(false); router.push('/student/settings'); }}>
              <Settings className="size-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => toast.message('Change password', { description: 'Use Account Settings when connected.' })}
            >
              <KeyRound className="size-4" />
              Change Password
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" className="rounded-lg" onClick={() => void handleLogout()}>
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
