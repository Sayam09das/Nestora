import { HomeHero } from '@/components/marketing/home-hero';
import { FeaturesSection } from '@/components/marketing/landing/features-section';
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
        <FeaturesSection />
      </main>
    </>
  );
}
