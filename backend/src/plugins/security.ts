import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { allowedOrigins, env } from '../config/env.js';

export const securityPlugin = fp(async (fastify) => {
  await fastify.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed = allowedOrigins.includes(origin);
      callback(isAllowed ? null : new Error('Origin not allowed by CORS policy'), isAllowed);
    },
    credentials: false,
  });

  await fastify.register(helmet, {
    global: true,
    crossOriginEmbedderPolicy: false,
  });

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  });
});
