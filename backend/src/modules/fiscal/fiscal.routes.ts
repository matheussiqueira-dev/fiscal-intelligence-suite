import { FastifyInstance } from 'fastify';
import { ok } from '../../core/response.js';
import { parseOrThrow } from '../../core/validation.js';
import { QueryType } from '../../domain/types.js';
import { QueryService } from '../queries/query.service.js';
import {
  comparisonAnalysisBodySchema,
  freeChatBodySchema,
  municipalAnalysisBodySchema,
  riskRankingQuerySchema,
  scenarioBodySchema,
  stateAnalysisBodySchema,
  stateFilterQuerySchema,
  stateParamsSchema,
} from './fiscal.schemas.js';
import { FiscalService } from './fiscal.service.js';

interface FiscalDependencies {
  fiscalService: FiscalService;
  queryService: QueryService;
}

const withAudit = async <T>(
  queryService: QueryService,
  input: {
    userId: string;
    queryType: QueryType;
    prompt: string;
    metadata?: Record<string, unknown>;
  },
  operation: () => Promise<T>,
): Promise<T> => {
  const startedAt = Date.now();

  try {
    const result = await operation();

    await queryService.recordQuery({
      userId: input.userId,
      queryType: input.queryType,
      prompt: input.prompt,
      metadata: input.metadata,
      status: 'success',
      latencyMs: Date.now() - startedAt,
    });

    return result;
  } catch (error) {
    await queryService.recordQuery({
      userId: input.userId,
      queryType: input.queryType,
      prompt: input.prompt,
      metadata: {
        ...input.metadata,
        error: error instanceof Error ? error.message : 'unknown',
      },
      status: 'error',
      latencyMs: Date.now() - startedAt,
    });

    throw error;
  }
};

export const registerFiscalRoutes = async (
  app: FastifyInstance,
  dependencies: FiscalDependencies,
): Promise<void> => {
  app.get('/api/v1/states', { preHandler: [app.authenticate] }, async (request) => {
    const query = parseOrThrow(stateFilterQuerySchema, request.query);
    const states = dependencies.fiscalService.listStates(query);
    return ok(states, { total: states.length });
  });

  app.get('/api/v1/states/:uf', { preHandler: [app.authenticate] }, async (request) => {
    const params = parseOrThrow(stateParamsSchema, request.params);
    const state = dependencies.fiscalService.getStateByUf(params.uf);
    return ok(state);
  });

  app.get('/api/v1/insights/risk-ranking', { preHandler: [app.authenticate] }, async (request) => {
    const query = parseOrThrow(riskRankingQuerySchema, request.query);
    const ranking = dependencies.fiscalService.getRiskRanking(query.limit ?? 10);
    return ok(ranking, { total: ranking.length });
  });

  app.post('/api/v1/scenarios/simulate', { preHandler: [app.authenticate] }, async (request) => {
    const body = parseOrThrow(scenarioBodySchema, request.body);
    const result = dependencies.fiscalService.simulateScenario({
      ...body,
      deltaIcms: body.deltaIcms ?? 0,
      deltaFcp: body.deltaFcp ?? 0,
    });

    await dependencies.queryService.recordQuery({
      userId: request.user.sub,
      queryType: 'scenario-simulation',
      prompt: `simulate scenario with icms ${body.icmsRate} and fcp ${body.fcpRate}`,
      status: 'success',
      latencyMs: 0,
      metadata: {
        baseRevenue: body.baseRevenue,
      },
    });

    return ok(result);
  });

  app.post(
    '/api/v1/analysis/state',
    { preHandler: [app.authenticate, app.authorize(['admin', 'analyst'])] },
    async (request) => {
      const body = parseOrThrow(stateAnalysisBodySchema, request.body);
      const prompt = `state-analysis:${body.uf}:${body.fromYear}-${body.toYear}`;

      const result = await withAudit(
        dependencies.queryService,
        {
          userId: request.user.sub,
          queryType: 'state-analysis',
          prompt,
          metadata: body,
        },
        async () =>
          dependencies.fiscalService.analyzeState(body.uf, body.fromYear ?? 2018, body.toYear ?? 2025),
      );

      return ok(result);
    },
  );

  app.post(
    '/api/v1/analysis/municipal',
    { preHandler: [app.authenticate, app.authorize(['admin', 'analyst'])] },
    async (request) => {
      const body = parseOrThrow(municipalAnalysisBodySchema, request.body);
      const prompt = `municipal-analysis:${body.city}:${body.uf}:${body.fromYear}-${body.toYear}`;

      const result = await withAudit(
        dependencies.queryService,
        {
          userId: request.user.sub,
          queryType: 'municipal-analysis',
          prompt,
          metadata: body,
        },
        async () =>
          dependencies.fiscalService.analyzeMunicipality(
            body.city,
            body.uf,
            body.fromYear ?? 2018,
            body.toYear ?? 2025,
          ),
      );

      return ok(result);
    },
  );

  app.post(
    '/api/v1/analysis/compare',
    { preHandler: [app.authenticate, app.authorize(['admin', 'analyst'])] },
    async (request) => {
      const body = parseOrThrow(comparisonAnalysisBodySchema, request.body);
      const prompt = `comparison-analysis:${body.primaryUf}:${body.secondaryUf}:${body.fromYear}-${body.toYear}`;

      const result = await withAudit(
        dependencies.queryService,
        {
          userId: request.user.sub,
          queryType: 'comparison-analysis',
          prompt,
          metadata: body,
        },
        async () =>
          dependencies.fiscalService.analyzeComparison(
            body.primaryUf,
            body.secondaryUf,
            body.fromYear ?? 2018,
            body.toYear ?? 2025,
          ),
      );

      return ok(result);
    },
  );

  app.post(
    '/api/v1/analysis/chat',
    { preHandler: [app.authenticate, app.authorize(['admin', 'analyst'])] },
    async (request) => {
      const body = parseOrThrow(freeChatBodySchema, request.body);

      const result = await withAudit(
        dependencies.queryService,
        {
          userId: request.user.sub,
          queryType: 'free-chat',
          prompt: body.prompt,
        },
        async () => dependencies.fiscalService.freeChat(body.prompt),
      );

      return ok(result);
    },
  );
};
