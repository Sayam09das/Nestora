/** Map noisy API / Prisma messages to admin-friendly copy. */
export function humanizeApiErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return 'Something went wrong. Please try again.';
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes("can't reach database") || lower.includes('unable to reach the database')) {
    return trimmed;
  }
  if (trimmed.includes('Invalid `prisma.') || lower.includes('prismaclient')) {
    return 'Could not load live data — the database may be unreachable or still waking up. Retry in a few seconds.';
  }
  if (trimmed.length > 240 && (trimmed.includes('invocation') || trimmed.includes('apps/api/'))) {
    return 'A server error occurred while loading data. Use Retry or check that the API and database are running.';
  }

  return trimmed;
}
