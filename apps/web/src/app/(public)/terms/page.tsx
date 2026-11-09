import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Terms of service',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[var(--container-marketing)] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-h1 font-semibold text-foreground">Terms of service</h1>
      <p className="mt-4 max-w-2xl text-body text-muted-foreground">
        Terms governing use of Nestora will be published here ahead of product launch. For early
        access discussions, reach out via the{' '}
        <a href="/contact" className="text-primary underline-offset-2 hover:underline">
          contact page
        </a>
        .
      </p>
    </main>
  );
}
