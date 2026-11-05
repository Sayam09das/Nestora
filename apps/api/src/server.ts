import { disconnectDatabase } from '@nestora/database';
import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

async function start(): Promise<void> {
  const env = loadEnv();
  const app = await buildApp(env);

  await app.listen({ port: env.PORT, host: env.HOST });

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Shutting down HTTP server');
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

start().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
