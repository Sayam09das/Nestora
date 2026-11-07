import cors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { getAllowedCorsOrigins } from '../config/cors-origins.js';
import type { Env } from '../config/env.js';

export const corsPlugin: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  const allowedSet = new Set(getAllowedCorsOrigins(opts.env));

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        return cb(null, true);
      }
      if (allowedSet.has(origin)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
  });
};

export const corsPluginWrapped = fp(corsPlugin, { name: 'cors' });
