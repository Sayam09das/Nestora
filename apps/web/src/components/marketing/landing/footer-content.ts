export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  id: string;
  title: string;
  links: readonly FooterLink[];
};

export const footerBrand = {
  tagline: 'Simplifying hostel operations, one step at a time.',
  description:
    'Nestora helps university housing teams manage students, rooms, fees, and daily hostel workflows from one organized platform.',
} as const;

export const footerColumns: FooterColumn[] = [
  {
    id: 'product',
    title: 'Product',
    links: [
      { label: 'Overview', href: '/' },
      { label: 'Features', href: '/#features' },
      { label: 'Roles & access', href: '/#roles' },
      { label: 'Dashboard preview', href: '/#dashboard-preview' },
      { label: 'Security', href: '/#roles' },
    ],
  },
  {
    id: 'modules',
    title: 'Management modules',
    links: [
      { label: 'Student management', href: '/#features' },
      { label: 'Room management', href: '/#features' },
      { label: 'Attendance', href: '/#features' },
      { label: 'Fees & payments', href: '/#features' },
      { label: 'Complaints & maintenance', href: '/#features' },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    links: [
      { label: 'FAQ', href: '/#faq' },
      { label: 'Admin console', href: '/admin/login' },
      { label: 'Institutional sign-in', href: '/login' },
      { label: 'Help & support', href: '/contact' },
      { label: 'Contact us', href: '/contact' },
      { label: 'About', href: '/about' },
    ],
  },
];
