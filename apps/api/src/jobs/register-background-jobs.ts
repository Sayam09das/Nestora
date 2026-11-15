import type { FastifyInstance } from 'fastify';
import { runOverdueGatePassAlerts } from './overdue-gate-pass.job.js';

const TICK_MS = 5 * 60 * 1000;

export function registerBackgroundJobs(app: FastifyInstance): void {
  const run = () => {
    void runOverdueGatePassAlerts(app.prisma)
      .then((count) => {
        if (count > 0) {
          app.log.info({ count }, 'MOD-10 overdue gate pass alerts dispatched');
        }
      })
      .catch((err) => {
        app.log.error({ err }, 'MOD-10 overdue gate pass job failed');
      });
  };

  run();
  const timer = setInterval(run, TICK_MS);
  app.addHook('onClose', async () => {
    clearInterval(timer);
  });
}