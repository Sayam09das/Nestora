import type { ReactNode } from 'react';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingSiteFooter } from '@/components/marketing/site-footer';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <MarketingNavbar />
      {children}
      <MarketingSiteFooter />
    </>
  );
}
