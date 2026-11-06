import type { Metadata } from 'next';
import { absoluteUrl, brandAssets, getSiteUrl, siteConfig } from './config';

type PageMetadataOptions = {
  title: string;
  description?: string;
  /** Path only, e.g. `/` or `/about`. */
  path?: string;
  /** When true, adds noindex/nofollow (login, dashboards, etc.). */
  noIndex?: boolean;
  /** Skip the `%s | Nestora` title template (e.g. home page H1 title). */
  absoluteTitle?: boolean;
};

function sharedOpenGraph(options: {
  title: string;
  description: string;
  path: string;
}): Metadata['openGraph'] {
  const url = absoluteUrl(options.path);
  return {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: options.title,
    description: options.description,
    url,
    images: [
      {
        url: brandAssets.social,
        alt: `${siteConfig.name} — ${siteConfig.product}`,
      },
    ],
  };
}

function sharedTwitter(options: { title: string; description: string }): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title: options.title,
    description: options.description,
    images: [brandAssets.social],
  };
}

/** Default metadata for the root layout (inherited by public pages). */
export function createRootMetadata(): Metadata {
  const titleDefault = `${siteConfig.name} — University Hostel Management`;
  const description = siteConfig.description;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: titleDefault,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    applicationName: siteConfig.name,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    publisher: siteConfig.publisher.name,
    category: 'education',
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: sharedOpenGraph({
      title: titleDefault,
      description,
      path: '/',
    }),
    twitter: sharedTwitter({ title: titleDefault, description }),
    icons: {
      icon: [{ url: brandAssets.icon, type: 'image/png' }],
      shortcut: [brandAssets.icon],
      apple: [{ url: brandAssets.icon, type: 'image/png' }],
    },
  };
}

/** Page-level metadata for existing public routes. */
export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const description = options.description ?? siteConfig.description;
  const path = options.path ?? '/';
  const robots = options.noIndex ? { index: false, follow: false, nocache: true } : undefined;

  return {
    title: options.absoluteTitle ? { absolute: options.title } : options.title,
    description,
    alternates: {
      canonical: path,
    },
    robots,
    openGraph: options.noIndex
      ? undefined
      : sharedOpenGraph({ title: options.title, description, path }),
    twitter: options.noIndex
      ? { card: 'summary', title: options.title, description }
      : sharedTwitter({ title: options.title, description }),
  };
}

/** Reusable metadata for future auth / dashboard routes. */
export function createPrivatePageMetadata(
  title: string,
  description?: string,
  path?: string,
): Metadata {
  return createPageMetadata({
    title,
    description,
    path,
    noIndex: true,
  });
}
