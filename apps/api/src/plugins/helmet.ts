import helmet from '@fastify/helmet';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const helmetPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(helmet);
};

export const helmetPlugin = fp(helmetPluginImpl, { name: 'helmet' });
