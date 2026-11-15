import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Session cookies are host-specific. Mixing `localhost` and `127.0.0.1` breaks auth after login.
 * Canonicalize loopback access to match `NEXT_PUBLIC_SITE_URL` in development.
 */
export function middleware(request: NextRequest) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  try {
    const canonical = new URL(site);
    const current = request.nextUrl.clone();

    const loopbackHosts = new Set(['localhost', '127.0.0.1']);
    if (!loopbackHosts.has(current.hostname) || !loopbackHosts.has(canonical.hostname)) {
      return NextResponse.next();
    }

    if (current.hostname === canonical.hostname) {
      return NextResponse.next();
    }

    current.hostname = canonical.hostname;
    if (canonical.port) {
      current.port = canonical.port;
    }
    return NextResponse.redirect(current);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};