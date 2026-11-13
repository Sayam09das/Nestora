'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

import { getStaffInitials } from '@/components/dashboard/staff/admin-staff-data';
import { cn } from '@/lib/utils';

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClass = {
  sm: 'size-9 text-xs rounded-xl',
  md: 'size-10 text-xs rounded-xl',
  lg: 'size-20 text-2xl rounded-2xl sm:size-24',
} as const;

export function StaffDirectoryAvatar({ name, photoUrl, size = 'sm', className }: Props) {
  const reduceMotion = useReducedMotion();
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(photoUrl?.trim()) && !broken;
  const shell = cn(
    'flex shrink-0 items-center justify-center overflow-hidden border border-[var(--nestora-sage-muted)] font-bold text-[var(--nestora-forest)] shadow-sm',
    sizeClass[size],
    !showPhoto && 'bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))]',
    className,
  );

  if (showPhoto) {
    return (
      <motion.span
        className={shell}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl!}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      </motion.span>
    );
  }

  return (
    <motion.span
      className={shell}
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      aria-hidden
    >
      {getStaffInitials(name)}
    </motion.span>
  );
}
