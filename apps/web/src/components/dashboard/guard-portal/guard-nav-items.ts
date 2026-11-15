import { LayoutDashboard, ScrollText } from 'lucide-react';

export type GuardNavLink = {
  id: string;
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  isActive: (pathname: string) => boolean;
};

export const guardNavLinks: GuardNavLink[] = [
  {
    id: 'console',
    href: '/guard',
    label: 'Gate console',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === '/guard',
  },
  {
    id: 'movements',
    href: '/guard/movements',
    label: 'Movement log',
    icon: ScrollText,
    isActive: (pathname) => pathname.startsWith('/guard/movements'),
  },
];