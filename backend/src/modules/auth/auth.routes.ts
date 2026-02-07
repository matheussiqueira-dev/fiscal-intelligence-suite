import { FastifyInstance } from 'fastify';
import { ok } from '../../core/response.js';
import { parseOrThrow } from '../../core/validation.js';
import { AuthService } from './auth.service.js';
import { loginBodySchema } from './auth.schemas.js';

export const registerAuthRoutes = async (
  app: FastifyInstance,
  dependencies: { authService: AuthService },
): Promise<void> => {
  app.post('/api/v1/auth/login', async (request) => {
    const body = parseOrThrow(loginBodySchema, request.body);
    const data = await dependencies.authService.login(body.email, body.password);

    return ok(data);
  });

  app.get(
    '/api/v1/auth/me',
    { preHandler: [app.authenticate] },
    async (request) => {
      const user = await dependencies.authService.getUserById(request.user.sub);
      return ok(user);
    },
  );
};
