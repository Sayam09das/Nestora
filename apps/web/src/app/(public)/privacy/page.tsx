import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Privacy policy',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[var(--container-marketing)] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-h1 font-semibold text-foreground">Privacy policy</h1>
      <p className="mt-4 max-w-2xl text-body text-muted-foreground">
        Nestora treats student and hostel data as confidential. This page will publish our full
        privacy policy before general availability. Questions?{' '}
        <a href="/contact" className="text-primary underline-offset-2 hover:underline">
          Contact us
        </a>
        .
      </p>
    </main>
  );
}
