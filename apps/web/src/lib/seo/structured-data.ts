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

/** Landing page graph: Organization + WebSite (no invented contact or ratings). */
export function createLandingPageJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [createOrganizationJsonLd(), createWebSiteJsonLd()],
  };
}

export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
