/**
 * Avoid leaking Prisma stack traces and connection strings to API clients (including dev UIs).
 */
export function sanitizeClientErrorMessage(message: string, statusCode: number): string {
  if (statusCode >= 500) {
    const lower = message.toLowerCase();
    if (
      lower.includes("can't reach database server") ||
      lower.includes('prismaclientinitializationerror') ||
      lower.includes('connection pool') ||
      (lower.includes('neon.tech') && lower.includes('5432'))
    ) {
      return 'Unable to reach the database. Ensure Neon is running and DATABASE_URL is correct, then retry.';
    }
    if (message.includes('P1001') || message.includes('P1008') || message.includes('P1017')) {
      return 'Database connection failed. The server may be waking up — please retry in a few seconds.';
    }
    if (message.includes('P2028') || message.includes('P2024')) {
      return 'The database request timed out. Please retry.';
    }
    if (message.includes('Invalid `prisma.')) {
      return 'A database query failed. Check API logs and database connectivity.';
    }
  }

  if (message.length > 280 && message.includes('prisma.')) {
    return 'A database error occurred. See API server logs for details.';
  }

  return message;
}
