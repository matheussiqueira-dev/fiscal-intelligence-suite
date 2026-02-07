import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { AppError, NotFoundError } from '../../core/errors.js';
import { StateTaxProfile } from '../../domain/types.js';
import { BRAZIL_STATES } from './fiscal.constants.js';

interface AskAiResult {
  provider: 'gemini' | 'fallback';
  response: string;
  prompt: string;
  sources: Array<{
    title: string;
    uri: string;
    snippet?: string;
  }>;
}

interface SimulateScenarioInput {
  baseRevenue: number;
  icmsRate: number;
  fcpRate: number;
  deltaIcms: number;
  deltaFcp: number;
}

const TIMEOUT_MS = 25000;
const CACHE_LIMIT = 40;

const aiCache = new Map<string, AskAiResult>();

const raceWithTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new AppError('AI timeout reached.', 504, 'AI_TIMEOUT')), timeoutMs);

    promise
      .then((data) => {
        clearTimeout(timer);
        resolve(data);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

const maybeCache = (key: string, value: AskAiResult): void => {
  aiCache.set(key, value);

  if (aiCache.size <= CACHE_LIMIT) return;

  const firstKey = aiCache.keys().next().value;
  if (firstKey) {
    aiCache.delete(firstKey);
  }
};

export class FiscalService {
  private readonly aiClient = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

  listStates(filters: {
    search?: string;
    region?: StateTaxProfile['region'];
    benefitFundOnly?: boolean;
  }): StateTaxProfile[] {
    const search = filters.search?.toLowerCase();

    return BRAZIL_STATES.filter((state) => {
      const matchSearch =
        !search || state.name.toLowerCase().includes(search) || state.uf.toLowerCase().includes(search);
      const matchRegion = !filters.region || state.region === filters.region;
      const matchFund = !filters.benefitFundOnly || state.benefitFund;

      return matchSearch && matchRegion && matchFund;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  getStateByUf(uf: string): StateTaxProfile {
    const state = BRAZIL_STATES.find((item) => item.uf === uf.toUpperCase());

    if (!state) {
      throw new NotFoundError(`State with UF '${uf}' was not found.`);
    }

    return state;
  }

  getRiskRanking(limit: number): Array<StateTaxProfile & { riskScore: number; riskLevel: string }> {
    return BRAZIL_STATES.map((state) => {
      const riskScore = Number(
        (
          state.internalRate * 0.5 +
          state.fcpRate * 2 +
          (state.benefitFund ? 2 : 0) +
          (state.internalRate + state.fcpRate >= 22 ? 1.5 : 0)
        ).toFixed(2),
      );

      const riskLevel = riskScore >= 16 ? 'high' : riskScore >= 12 ? 'medium' : 'low';

      return {
        ...state,
        riskScore,
        riskLevel,
      };
    })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  }

  simulateScenario(input: SimulateScenarioInput): {
    currentEffectiveRate: number;
    projectedEffectiveRate: number;
    variationPercent: number;
    projectedRevenue: number;
    deltaRevenue: number;
  } {
    const currentEffectiveRate = input.icmsRate + input.fcpRate;
    const projectedEffectiveRate = Math.max(0, currentEffectiveRate + input.deltaIcms + input.deltaFcp);
    const variationPercent =
      currentEffectiveRate === 0 ? 0 : ((projectedEffectiveRate - currentEffectiveRate) / currentEffectiveRate) * 100;

    const projectedRevenue = input.baseRevenue * (1 + variationPercent / 100);
    const deltaRevenue = projectedRevenue - input.baseRevenue;

    return {
      currentEffectiveRate: Number(currentEffectiveRate.toFixed(2)),
      projectedEffectiveRate: Number(projectedEffectiveRate.toFixed(2)),
      variationPercent: Number(variationPercent.toFixed(2)),
      projectedRevenue: Number(projectedRevenue.toFixed(2)),
      deltaRevenue: Number(deltaRevenue.toFixed(2)),
    };
  }

  async analyzeState(uf: string, fromYear: number, toYear: number): Promise<AskAiResult> {
    const state = this.getStateByUf(uf);

    const prompt = [
      `Analise a arrecadacao de ICMS de ${state.name} (${state.uf}) entre ${fromYear} e ${toYear}.`,
      'Inclua FCP/FECOP, base legal, variacao anual e risco de caixa estadual.',
      'Destaque fundos de compensacao por beneficios fiscais e cite fontes oficiais (Siconfi, CONFAZ e SEFAZ).',
    ].join(' ');

    return this.askAi(prompt);
  }

  async analyzeMunicipality(city: string, uf: string, fromYear: number, toYear: number): Promise<AskAiResult> {
    const state = this.getStateByUf(uf);

    const prompt = [
      `Analise o municipio de ${city} (${state.uf}) entre ${fromYear} e ${toYear}.`,
      'Entregue uma tabela com ISS arrecadado e cota-parte de ICMS.',
      'Marque claramente dados parciais de 2024/2025 e cite apenas fontes oficiais.',
    ].join(' ');

    return this.askAi(prompt);
  }

  async analyzeComparison(
    primaryUf: string,
    secondaryUf: string,
    fromYear: number,
    toYear: number,
  ): Promise<AskAiResult> {
    const primary = this.getStateByUf(primaryUf);
    const secondary = this.getStateByUf(secondaryUf);

    const prompt = [
      `Compare ${primary.name} (${primary.uf}) com ${secondary.name} (${secondary.uf}) entre ${fromYear} e ${toYear}.`,
      'Avalie ICMS, FCP/FECOP, mecanismos compensatorios e impacto potencial na competitividade fiscal.',
      'Retorne com tabela anual e fontes oficiais obrigatorias.',
    ].join(' ');

    return this.askAi(prompt);
  }

  async freeChat(prompt: string): Promise<AskAiResult> {
    return this.askAi(prompt);
  }

  private async askAi(prompt: string): Promise<AskAiResult> {
    const cacheKey = prompt.toLowerCase();
    const cached = aiCache.get(cacheKey);

    if (cached) {
      return {
        ...cached,
        response: `${cached.response}\n\n[cache-hit: resposta reaproveitada para reduzir latencia]`,
      };
    }

    if (!this.aiClient) {
      const fallback = this.fallbackAnswer(prompt);
      maybeCache(cacheKey, fallback);
      return fallback;
    }

    try {
      const response = await raceWithTimeout(
        this.aiClient.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            systemInstruction:
              'Voce e um analista fiscal backend. Responda com objetividade, use tabelas quando possivel e cite fontes oficiais do Brasil.',
            tools: [{ googleSearch: {} }],
          },
        }),
        TIMEOUT_MS,
      );

      const text = response.text?.trim() || 'No response generated by model.';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sourceMap = new Map<string, { title: string; uri: string; snippet?: string }>();

      chunks.forEach((chunk: any) => {
        if (!chunk?.web?.uri) return;

        sourceMap.set(chunk.web.uri, {
          title: chunk.web.title || 'Official source',
          uri: chunk.web.uri,
          snippet: chunk.web.snippet || chunk.web.description,
        });
      });

      const result: AskAiResult = {
        provider: 'gemini',
        response: text,
        prompt,
        sources: Array.from(sourceMap.values()),
      };

      maybeCache(cacheKey, result);
      return result;
    } catch (error) {
      const fallback = this.fallbackAnswer(prompt, error instanceof Error ? error.message : undefined);
      maybeCache(cacheKey, fallback);
      return fallback;
    }
  }

  private fallbackAnswer(prompt: string, reason?: string): AskAiResult {
    return {
      provider: 'fallback',
      prompt,
      response: [
        'Gemini is unavailable or not configured for this environment.',
        'This fallback keeps API stability while preserving secure key handling on the backend.',
        reason ? `Fallback reason: ${reason}` : undefined,
      ]
        .filter(Boolean)
        .join(' '),
      sources: [],
    };
  }
}
