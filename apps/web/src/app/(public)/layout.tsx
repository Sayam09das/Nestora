import type { ReactNode } from 'react';
import { MarketingNavbar } from '@/components/marketing/navbar';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <MarketingNavbar />
      {children}
    </>
  );
}
