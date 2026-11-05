export function requireDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Copy packages/database/.env.example to packages/database/.env (or set DATABASE_URL in the environment).',
    );
  }
  return databaseUrl;
}
