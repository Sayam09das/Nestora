import type { ReactNode } from 'react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNavbar } from '@/components/marketing/navbar';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <div className="min-w-0 flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}
