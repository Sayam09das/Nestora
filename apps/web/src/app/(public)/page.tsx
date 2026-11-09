import { HomeHero } from '@/components/marketing/home-hero';
import { BenefitsSection } from '@/components/marketing/landing/benefits-section';
import { faqItems } from '@/components/marketing/landing/faq-content';
import { FaqSection } from '@/components/marketing/landing/faq-section';
import { FeaturesSection } from '@/components/marketing/landing/features-section';
import { FinalCtaSection } from '@/components/marketing/landing/final-cta-section';
import { HighlightsSection } from '@/components/marketing/landing/highlights-section';
import { RolesSection } from '@/components/marketing/landing/roles-section';
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
      <JsonLd data={createLandingPageJsonLd(faqItems)} />
      <main className="min-w-0" id="page-home">
        <HomeHero />
        <HighlightsSection />
        <FeaturesSection />
        <RolesSection />
        <BenefitsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
    </>
  );
}
