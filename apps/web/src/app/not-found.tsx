import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Page not found',
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground text-sm">The page you requested does not exist.</p>
      <Link className="text-primary text-sm underline-offset-4 hover:underline" href="/">
        Back to home
      </Link>
    </main>
  );
}
