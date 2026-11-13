/** Live desk metric: show placeholder while loading, never static demo fallbacks. */
export function liveMetricNumber(
  value: number | undefined | null,
  loading: boolean | undefined,
): number | '—' {
  if (value != null) return value;
  return loading ? '—' : 0;
}

export function liveMetricText(
  value: string | number | undefined | null,
  loading: boolean | undefined,
  empty = '—',
): string | number {
  if (value != null && value !== '') return value;
  return loading ? '—' : empty;
}
