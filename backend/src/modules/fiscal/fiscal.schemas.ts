import { z } from 'zod';

const regionSchema = z.enum(['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']);

export const stateFilterQuerySchema = z.object({
  search: z.string().trim().min(1).max(60).optional(),
  region: regionSchema.optional(),
  benefitFundOnly: z.coerce.boolean().optional(),
});

export const stateParamsSchema = z.object({
  uf: z.string().trim().toUpperCase().length(2),
});

export const stateAnalysisBodySchema = z.object({
  uf: z.string().trim().toUpperCase().length(2),
  fromYear: z.coerce.number().int().min(2010).max(2035).default(2018),
  toYear: z.coerce.number().int().min(2010).max(2035).default(2025),
});

export const municipalAnalysisBodySchema = z.object({
  city: z.string().trim().min(2).max(80),
  uf: z.string().trim().toUpperCase().length(2),
  fromYear: z.coerce.number().int().min(2010).max(2035).default(2018),
  toYear: z.coerce.number().int().min(2010).max(2035).default(2025),
});

export const comparisonAnalysisBodySchema = z.object({
  primaryUf: z.string().trim().toUpperCase().length(2),
  secondaryUf: z.string().trim().toUpperCase().length(2),
  fromYear: z.coerce.number().int().min(2010).max(2035).default(2018),
  toYear: z.coerce.number().int().min(2010).max(2035).default(2025),
});

export const freeChatBodySchema = z.object({
  prompt: z.string().trim().min(8).max(1800),
});

export const scenarioBodySchema = z.object({
  baseRevenue: z.coerce.number().positive().max(10_000_000_000_000),
  icmsRate: z.coerce.number().min(0).max(40),
  fcpRate: z.coerce.number().min(0).max(20),
  deltaIcms: z.coerce.number().min(-10).max(10).default(0),
  deltaFcp: z.coerce.number().min(-10).max(10).default(0),
});

export const riskRankingQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(27).default(10),
});
