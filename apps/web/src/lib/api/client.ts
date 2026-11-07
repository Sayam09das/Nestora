const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

export type ApiFetchOptions = RequestInit & {
  /** When true, include cookies (session). Default true. */
  withCredentials?: boolean;
};

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { withCredentials = true, headers: headerInit, ...rest } = options;
  const headers = new Headers(headerInit);
  if (rest.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((rest.method ?? 'GET').toUpperCase())) {
    headers.set('X-Nestora-Requested-With', 'XMLHttpRequest');
  }
  return fetch(`${baseUrl}${path}`, {
    ...rest,
    headers,
    credentials: withCredentials ? 'include' : 'same-origin',
  });
}
