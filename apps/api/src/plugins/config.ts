import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import type { Env } from '../config/env.js';

export const configPlugin: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  app.decorate('config', opts.env);
};

export const configPluginWrapped = fp(configPlugin, { name: 'config' });
