import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import { createRootMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(inter.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
