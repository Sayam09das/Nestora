import rateLimit from '@fastify/rate-limit';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import type { Env } from '../config/env.js';

export const rateLimitPlugin: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  await app.register(rateLimit, {
    max: opts.env.RATE_LIMIT_MAX,
    timeWindow: '1 minute',
  });
};

export const rateLimitPluginWrapped = fp(rateLimitPlugin, { name: 'rate-limit' });
