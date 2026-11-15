import { CreditCard, DoorOpen, LayoutDashboard } from 'lucide-react';

export const accountantNavLinks = [
  {
    id: 'home',
    href: '/accountant',
    label: 'Overview',
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === '/accountant',
  },
  {
    id: 'fees',
    href: '/accountant/fees',
    label: 'Fees & ledgers',
    icon: CreditCard,
    isActive: (pathname: string) => pathname.startsWith('/accountant/fees'),
  },
  {
    id: 'checkout',
    href: '/accountant/checkout',
    label: 'Vacate clearance',
    icon: DoorOpen,
    isActive: (pathname: string) => pathname.startsWith('/accountant/checkout'),
  },
] as const;