import { absoluteUrl, brandAssets, getSiteUrl, siteConfig } from './config';

type JsonLd = Record<string, unknown>;

export function createWebSiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: getSiteUrl(),
    inLanguage: siteConfig.language,
  };
}

export function createOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: getSiteUrl(),
    logo: absoluteUrl(brandAssets.icon),
  };
}

export function createFaqPageJsonLd(items: Array<{ question: string; answer: string }>): JsonLd {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** Landing page graph: Organization + WebSite + optional FAQPage (no invented contact or ratings). */
export function createLandingPageJsonLd(
  faqItems?: Array<{ question: string; answer: string }>,
): JsonLd {
  const graph: JsonLd[] = [createOrganizationJsonLd(), createWebSiteJsonLd()];
  if (faqItems && faqItems.length > 0) {
    graph.push(createFaqPageJsonLd(faqItems));
  }
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
