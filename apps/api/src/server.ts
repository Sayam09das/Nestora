import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

async function start(): Promise<void> {
  const env = loadEnv();
  const app = await buildApp(env);

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error: unknown) {
    app.log.error({ err: error }, 'failed to start HTTP server');
    throw error;
  }

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    app.log.info({ signal }, 'shutting down HTTP server');
    try {
      await app.close();
    } catch (error: unknown) {
      app.log.error({ err: error }, 'error while closing HTTP server');
      process.exitCode = 1;
    } finally {
      process.exit(process.exitCode ?? 0);
    }
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

start().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
