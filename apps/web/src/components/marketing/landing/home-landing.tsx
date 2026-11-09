'use client';

import { BenefitsSection } from '@/components/marketing/landing/benefits-section';
import { FeaturesSection } from '@/components/marketing/landing/features-section';
import { FinalCtaSection } from '@/components/marketing/landing/final-cta-section';
import { HowItWorksSection } from '@/components/marketing/landing/how-it-works-section';
import { RolesSection } from '@/components/marketing/landing/roles-section';
import { TrustSection } from '@/components/marketing/landing/trust-section';

export function HomeLanding() {
  return (
    <>
      <TrustSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RolesSection />
      <BenefitsSection />
      <FinalCtaSection />
    </>
  );
}
