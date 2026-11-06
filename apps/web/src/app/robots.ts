import type { MetadataRoute } from 'next';
import { getSiteUrl, siteConfig } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  const disallow = [...siteConfig.privatePathPrefixes];

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
  };
}
