import type { MetadataRoute } from 'next';
import { brandAssets, siteConfig } from '@/lib/seo/config';

/** Matches Nestora light theme tokens in globals.css (--background, --primary). */
const THEME_COLOR = '#8c83b8';
const BACKGROUND_COLOR = '#f7f7f5';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: siteConfig.language,
    dir: 'ltr',
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    categories: ['education', 'productivity'],
    icons: [
      {
        src: brandAssets.icon,
        sizes: '1254x1254',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: brandAssets.icon,
        sizes: '1254x1254',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
