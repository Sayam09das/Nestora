import type { FastifyInstance } from 'fastify';
import { runComplaintAutoClose } from './complaint-auto-close.job.js';
import { runConsecutiveAbsenceAlerts } from './consecutive-absence.job.js';
import { runLateFeeAssessments } from './late-fee.job.js';
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

    void runConsecutiveAbsenceAlerts(app.prisma)
      .then((count) => {
        if (count > 0) {
          app.log.info({ count }, 'MOD-09 consecutive absence alerts dispatched');
        }
      })
      .catch((err) => {
        app.log.error({ err }, 'MOD-09 consecutive absence job failed');
      });

    void runComplaintAutoClose(app.prisma)
      .then((count) => {
        if (count > 0) {
          app.log.info({ count }, 'MOD-12 complaint auto-close transitions');
        }
      })
      .catch((err) => {
        app.log.error({ err }, 'MOD-12 complaint auto-close job failed');
      });

    void runLateFeeAssessments(app.prisma)
      .then((count) => {
        if (count > 0) {
          app.log.info({ count }, 'MOD-14 late fee assessments applied');
        }
      })
      .catch((err) => {
        app.log.error({ err }, 'MOD-14 late fee job failed');
      });
  };

  run();
  const timer = setInterval(run, TICK_MS);
  app.addHook('onClose', async () => {
    clearInterval(timer);
  });
}