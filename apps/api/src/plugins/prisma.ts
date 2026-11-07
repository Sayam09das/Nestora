import { connectDatabase, disconnectDatabase, prisma } from '@nestora/database';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const prismaPluginImpl: FastifyPluginAsync = async (app) => {
  app.decorate('prisma', prisma);

  app.addHook('onReady', async () => {
    await connectDatabase();
  });

  app.addHook('onClose', async () => {
    await disconnectDatabase();
  });
};

export const prismaPlugin = fp(prismaPluginImpl, {
  name: 'prisma',
});
