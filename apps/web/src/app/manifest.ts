import type { MetadataRoute } from 'next';
import { brandAssets, siteConfig } from '@/lib/seo/config';

/** Browser chrome: forest (nav CTA); splash uses cream page bg from globals.css. */
const THEME_COLOR = '#0c3b2e';
const BACKGROUND_COLOR = '#f5f4ec';

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
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: brandAssets.icon,
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
