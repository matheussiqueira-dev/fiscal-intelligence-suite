import fp from 'fastify-plugin';

type MetricsSnapshot = {
  totalRequests: number;
  totalErrors: number;
  averageLatencyMs: number;
  uptimeSeconds: number;
};

declare module 'fastify' {
  interface FastifyInstance {
    getMetrics: () => MetricsSnapshot;
  }
}

export const metricsPlugin = fp(async (fastify) => {
  let totalRequests = 0;
  let totalErrors = 0;
  let totalLatency = 0;
  const startedAt = Date.now();

  fastify.decorate('getMetrics', () => ({
    totalRequests,
    totalErrors,
    averageLatencyMs: totalRequests > 0 ? Number((totalLatency / totalRequests).toFixed(2)) : 0,
    uptimeSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(2)),
  }));

  fastify.addHook('onRequest', async (request) => {
    request.requestStartedAt = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    totalRequests += 1;

    if (reply.statusCode >= 500) {
      totalErrors += 1;
    }

    if (request.requestStartedAt) {
      totalLatency += Date.now() - request.requestStartedAt;
    }
  });

  fastify.addHook('onError', async () => {
    totalErrors += 1;
  });
});
