import { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ForbiddenError, UnauthorizedError } from '../core/errors.js';
import { JwtPayload, UserRole } from '../domain/types.js';
import { AuthService } from '../modules/auth/auth.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload;
    requestStartedAt?: number;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (allowedRoles: UserRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin = fp(async (fastify, options: { authService: AuthService }) => {
  const { authService } = options;

  fastify.decorate('authenticate', async (request: FastifyRequest) => {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing bearer token.');
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    request.user = authService.verifyToken(token);
  });

  fastify.decorate('authorize', (allowedRoles: UserRole[]) => {
    return async (request: FastifyRequest) => {
      if (!request.user) {
        throw new UnauthorizedError();
      }

      if (!allowedRoles.includes(request.user.role)) {
        throw new ForbiddenError();
      }
    };
  });
});

