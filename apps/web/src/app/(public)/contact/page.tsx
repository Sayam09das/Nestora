import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Contact Nestora',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-[var(--container-marketing)] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-h1 font-semibold text-foreground">Contact</h1>
      <p className="mt-2 text-body text-muted-foreground">Contact Nestora.</p>
    </main>
  );
}
