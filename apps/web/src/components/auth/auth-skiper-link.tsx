'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type AuthSkiperLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
} & Omit<ComponentProps<'a'>, 'href' | 'children' | 'className'>;

const skiperUnderlineClasses = cn(
  'group relative inline-flex w-fit max-w-full self-start items-center',
  "before:pointer-events-none before:absolute before:left-0 before:top-[1.35em] before:h-[0.06em] before:w-full before:bg-current before:content-['']",
  'before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]',
  'hover:before:origin-left hover:before:scale-x-100',
  'motion-reduce:before:transition-none motion-reduce:hover:before:scale-x-100',
);

function SkiperArrow({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        'ml-1 size-3 translate-y-px opacity-0 transition-[transform,opacity] duration-300',
        'group-hover:translate-y-0 group-hover:opacity-100',
        'motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthSkiperLink({
  href,
  children,
  className,
  external,
  ...rest
}: AuthSkiperLinkProps) {
  const classes = cn(skiperUnderlineClasses, className);

  if (external || href.startsWith('mailto:')) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
        <SkiperArrow />
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      <SkiperArrow />
    </Link>
  );
}
