import { parseApiResponse } from '@/lib/api/parse-response';

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

let csrfTokenPromise: Promise<string | null> | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  if (!baseUrl) {
    return null;
  }
  if (!csrfTokenPromise) {
    csrfTokenPromise = (async () => {
      const response = await fetch(`${baseUrl}/api/v1/auth/csrf-token`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const parsed = await parseApiResponse<{ csrfToken: string }>(response);
      csrfTokenPromise = null;
      return parsed.ok ? parsed.data.csrfToken : null;
    })();
  }
  return csrfTokenPromise;
}

export { fetchCsrfToken };

export function getApiBaseUrl(): string {
  return baseUrl;
}

export type ApiFetchOptions = RequestInit & {
  /** When true, include cookies (session). Default true. */
  withCredentials?: boolean;
};

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Paths that skip CSRF (must match API `CSRF_SKIP_PREFIXES` for auth bootstrap). */
const CSRF_EXEMPT_PREFIXES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/activate',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/verify-otp',
  '/api/v1/auth/password/reset',
  '/api/v1/auth/password/reset-with-link',
  '/api/v1/auth/csrf-token',
];

function pathNeedsCsrf(path: string, method: string): boolean {
  if (!MUTATING.has(method.toUpperCase())) {
    return false;
  }
  return !CSRF_EXEMPT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { withCredentials = true, headers: headerInit, ...rest } = options;
  const headers = new Headers(headerInit);
  if (rest.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const method = (rest.method ?? 'GET').toUpperCase();
  if (MUTATING.has(method)) {
    headers.set('X-Nestora-Requested-With', 'XMLHttpRequest');
  }
  if (pathNeedsCsrf(path, method)) {
    const token = await fetchCsrfToken();
    if (token) {
      headers.set('X-CSRF-Token', token);
    }
  }
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }
  return fetch(`${baseUrl}${path}`, {
    ...rest,
    headers,
    credentials: withCredentials ? 'include' : 'same-origin',
  });
}

/** Explicit mutating fetch (always attempts CSRF when required). */
export async function apiFetchMutating(
  path: string,
  options: Omit<ApiFetchOptions, 'method'> & { method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' },
): Promise<Response> {
  return apiFetch(path, options);
}
