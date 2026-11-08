import { HomeHero } from '@/components/marketing/home-hero';
import { HighlightsSection } from '@/components/marketing/landing/highlights-section';
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
      <main className="min-w-0" id="page-home">
        <HomeHero />
        <HighlightsSection />
        <div
          id="features"
          className="mx-auto max-w-[var(--container-marketing)] scroll-mt-20 px-4 py-8 text-body text-muted-foreground sm:px-6 lg:px-8"
        >
          Features anchor for marketing navigation.
        </div>
      </main>
    </>
  );
}
