import cookie from '@fastify/cookie';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import type { Env } from '../config/env.js';

export const cookiePlugin: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  await app.register(cookie, {
    secret: opts.env.COOKIE_SECRET,
    hook: 'onRequest',
  });
};

export const cookiePluginWrapped = fp(cookiePlugin, { name: 'cookie' });
