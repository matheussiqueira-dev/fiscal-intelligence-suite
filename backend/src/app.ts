import { resolve } from 'node:path';
import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env.js';
import { AppError } from './core/errors.js';
import { fail, ok } from './core/response.js';
import { JsonStore } from './infrastructure/store/jsonStore.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';
import { AuthService } from './modules/auth/auth.service.js';
import { UserRepository } from './modules/auth/user.repository.js';
import { registerFiscalRoutes } from './modules/fiscal/fiscal.routes.js';
import { FiscalService } from './modules/fiscal/fiscal.service.js';
import { QueryRepository } from './modules/queries/query.repository.js';
import { registerQueryRoutes } from './modules/queries/query.routes.js';
import { QueryService } from './modules/queries/query.service.js';
import { authPlugin } from './plugins/auth.js';
import { metricsPlugin } from './plugins/metrics.js';
import { securityPlugin } from './plugins/security.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
      redact: {
        paths: ['req.headers.authorization', 'req.body.password'],
        remove: true,
      },
    },
    bodyLimit: 1024 * 1024,
    trustProxy: true,
  });

  const store = new JsonStore(resolve(process.cwd(), 'data', 'store.json'));
  await store.init();

  const userRepository = new UserRepository(store);
  const authService = new AuthService(userRepository, env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const queryRepository = new QueryRepository(store);
  const queryService = new QueryService(queryRepository);
  const fiscalService = new FiscalService();

  await authService.seedUsers([
    {
      email: env.ADMIN_EMAIL,
      name: 'System Admin',
      role: 'admin',
      password: env.ADMIN_PASSWORD,
    },
    {
      email: env.ANALYST_EMAIL,
      name: 'Fiscal Analyst',
      role: 'analyst',
      password: env.ANALYST_PASSWORD,
    },
  ]);

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Fiscal Intelligence Suite API',
        description: 'Backend API for fiscal intelligence workflows with secure analysis endpoints.',
        version: '1.0.0',
      },
      servers: [{ url: `http://${env.HOST}:${env.PORT}` }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/api/v1/docs',
  });

  await app.register(securityPlugin);
  await app.register(metricsPlugin);
  await app.register(authPlugin, { authService });

  app.get('/api/v1/health', async () => {
    return ok({
      service: 'fiscal-intelligence-backend',
      status: 'healthy',
      environment: env.NODE_ENV,
      uptimeSeconds: process.uptime(),
    });
  });

  app.get('/api/v1/metrics', { preHandler: [app.authenticate, app.authorize(['admin'])] }, async () => {
    return ok(app.getMetrics());
  });

  await registerAuthRoutes(app, { authService });
  await registerFiscalRoutes(app, { fiscalService, queryService });
  await registerQueryRoutes(app, { queryService });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send(fail('NOT_FOUND', 'Route not found.'));
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      request.log.warn({ code: error.code, details: error.details }, error.message);
      reply.status(error.statusCode).send(fail(error.code, error.message, error.details));
      return;
    }

    request.log.error({ err: error }, 'Unhandled server error');
    reply.status(500).send(fail('INTERNAL_ERROR', 'Unexpected server error.'));
  });

  return app;
};
