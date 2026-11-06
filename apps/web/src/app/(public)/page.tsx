import { JsonLd } from '@/components/seo/json-ld';
import { createPageMetadata } from '@/lib/seo/metadata';
import { createLandingPageJsonLd } from '@/lib/seo/structured-data';

export const metadata = createPageMetadata({
  title: 'Nestora — University Hostel Management',
  absoluteTitle: true,
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={createLandingPageJsonLd()} />
      <main
        className="mx-auto max-w-[var(--container-marketing)] px-4 py-8 sm:px-6 lg:px-8"
        id="page-home"
      >
        <div id="features" className="min-h-0 scroll-mt-20 text-body text-muted-foreground">
          Features anchor for marketing navigation.
        </div>
      </main>
    </>
  );
}
