/**
 * Central SEO configuration for Nestora (public, non-secret values only).
 *
 * Production canonical URLs: set NEXT_PUBLIC_SITE_URL (e.g. https://nestora.example.edu).
 * Falls back to http://localhost:3000 in development.
 */
export const siteConfig = {
  name: 'Nestora',
  shortName: 'Nestora',
  product: 'University Hostel Management System',
  description:
    'A modern platform for managing university hostel operations, student accommodation, room allocation and hostel administration.',
  locale: 'en_IN',
  language: 'en',
  keywords: [
    'Nestora',
    'university hostel management',
    'student accommodation',
    'room allocation',
    'hostel administration',
    'campus housing',
    'hostel operations',
  ] as const,
  author: {
    name: 'Nestora',
  },
  publisher: {
    name: 'Nestora',
  },
  /** Paths that must never be indexed (also listed in robots.ts). */
  privatePathPrefixes: [
    '/api/',
    '/dashboard',
    '/admin',
    '/auth',
    '/login',
    '/register',
    '/account',
    '/settings',
  ] as const,
} as const;

const DEFAULT_DEV_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  return DEFAULT_DEV_SITE_URL;
}

/** Absolute URL for a public path (leading slash). */
export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized === '/' ? '' : normalized}` || base;
}

export const brandAssets = {
  /** Square mark — favicon, app icon, Apple touch icon (1254×1254). */
  icon: '/images/nestora-mark.svg',
  /** Wordmark — Open Graph / Twitter preview (2172×724; not 1200×630 ideal). */
  social: '/images/logo.png',
} as const;
