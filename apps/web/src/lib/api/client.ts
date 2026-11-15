import { parseApiResponse } from '@/lib/api/parse-response';

function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, '');
  if (trimmed.endsWith('/api/v1')) {
    return trimmed.slice(0, -'/api/v1'.length);
  }
  return trimmed;
}

function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Same-origin via `app/api/v1/[...path]` — session cookies stay on the web origin.
    return '';
  }
  return normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000');
}

function getBaseUrl(): string {
  return resolveApiBaseUrl();
}

let csrfTokenPromise: Promise<string | null> | null = null;

export function invalidateCsrfToken(): void {
  csrfTokenPromise = null;
}

async function fetchCsrfToken(): Promise<string | null> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = (async () => {
      const response = await fetch(`${getBaseUrl()}/api/v1/auth/csrf-token`, {
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
  return getBaseUrl();
}

/** Empty browser baseUrl is valid (App Router proxies `/api/v1` to the API). */
export function isApiConfigured(): boolean {
  if (typeof window !== 'undefined') {
    return true;
  }
  return Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
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

async function apiFetchOnce(path: string, options: ApiFetchOptions = {}): Promise<Response> {
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
  return fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers,
    credentials: withCredentials ? 'include' : 'same-origin',
  });
}

export const NESTORA_UNAUTHORIZED_EVENT = 'nestora:unauthorized';

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const response = await apiFetchOnce(path, options);
  if (response.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/login')) {
    window.dispatchEvent(new Event(NESTORA_UNAUTHORIZED_EVENT));
  }
  if (response.status !== 403 || !pathNeedsCsrf(path, options.method ?? 'GET')) {
    return response;
  }
  try {
    const clone = response.clone();
    const body = (await clone.json()) as { error?: { code?: string } };
    if (body.error?.code === 'CSRF_VALIDATION_FAILED') {
      invalidateCsrfToken();
      return apiFetchOnce(path, options);
    }
  } catch {
    /* not JSON */
  }
  return response;
}

/** Explicit mutating fetch (always attempts CSRF when required). */
export async function apiFetchMutating(
  path: string,
  options: Omit<ApiFetchOptions, 'method'> & { method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' },
): Promise<Response> {
  return apiFetch(path, options);
}
