import { connectDatabase, disconnectDatabase, prisma, type PrismaClient } from '@nestora/database';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const prismaPluginImpl: FastifyPluginAsync = async (app) => {
  app.decorate('prisma', prisma as unknown as PrismaClient);

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
