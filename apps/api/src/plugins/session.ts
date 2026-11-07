import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const sessionPluginImpl: FastifyPluginAsync = async (_app) => {
  // Session verification lives in middleware/authenticate.ts; cookie encryption uses @fastify/cookie.
};

export const sessionPluginWrapped = fp(sessionPluginImpl, { name: 'session' });
