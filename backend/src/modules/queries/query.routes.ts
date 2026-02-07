import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NotFoundError } from '../../core/errors.js';
import { ok } from '../../core/response.js';
import { parseOrThrow } from '../../core/validation.js';
import { QueryService } from './query.service.js';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  scope: z.enum(['mine', 'global']).optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const registerQueryRoutes = async (
  app: FastifyInstance,
  dependencies: { queryService: QueryService },
): Promise<void> => {
  app.get(
    '/api/v1/queries',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const query = parseOrThrow(listQuerySchema, request.query);
      const limit = query.limit ?? 30;

      if (query.scope === 'global') {
        await app.authorize(['admin'])(request, reply);
        const logs = await dependencies.queryService.listGlobalHistory(limit);
        return ok(logs, { scope: 'global', limit });
      }

      const logs = await dependencies.queryService.listUserHistory(request.user.sub, limit);
      return ok(logs, { scope: 'mine', limit });
    },
  );

  app.delete(
    '/api/v1/queries/:id',
    { preHandler: [app.authenticate] },
    async (request) => {
      const params = parseOrThrow(idParamSchema, request.params);
      const deleted = await dependencies.queryService.deleteUserHistoryItem(params.id, request.user.sub);

      if (!deleted) {
        throw new NotFoundError('History item not found for this user.');
      }

      return ok({ deleted: true });
    },
  );
};
