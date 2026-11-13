const TRANSIENT_CODES = new Set(['P1001', 'P1002', 'P1017']);

export function isTransientDbError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  if (TRANSIENT_CODES.has(code)) return true;
  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  return (
    message.includes("Can't reach database server") ||
    message.includes('Connection terminated') ||
    message.includes('Connection timed out') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT')
  );
}

function retryAttempts(): number {
  return process.env.NODE_ENV === 'production' ? 4 : 6;
}

function backoffMs(attempt: number): number {
  return Math.min(500 * 2 ** (attempt - 1), 4_000);
}

export async function runWithDbRetry<T>(
  operation: () => Promise<T>,
  reconnect?: () => Promise<void>,
): Promise<T> {
  const maxAttempts = retryAttempts();
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const canRetry = attempt < maxAttempts && isTransientDbError(error);
      if (!canRetry) throw error;
      if (reconnect) {
        await reconnect().catch(() => undefined);
      }
      await new Promise((resolve) => setTimeout(resolve, backoffMs(attempt)));
    }
  }

  throw lastError;
}
