import { GoogleGenAI } from '@google/genai';
import { ChatMessage, GroundingSource } from '../types';

const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const TIMEOUT_MS = 25000;

const SYSTEM_PROMPT = [
  'Voce e um consultor fiscal senior especializado em arrecadacao publica no Brasil.',
  'Escopo principal: ICMS estadual, ISS municipal, FCP/FECOP, cota-parte de ICMS e fundos de compensacao.',
  'Sempre priorize fontes oficiais (Siconfi/STN, CONFAZ, SEFAZ, Portais de Transparencia).',
  'Quando houver dados incompletos para 2024/2025, sinalize que sao parciais ou projecoes.',
  'Sempre que possivel, entregue tabela anual e cite links usados.',
].join(' ');

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Tempo limite excedido ao consultar modelo de IA.')), timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
};

const normalizeSources = (rawMetadata: unknown): GroundingSource[] => {
  const candidateMetadata = rawMetadata as {
    groundingChunks?: Array<{
      web?: {
        title?: string;
        uri?: string;
        snippet?: string;
        description?: string;
      };
    }>;
  };

  const chunks = candidateMetadata?.groundingChunks || [];
  const dedup = new Map<string, GroundingSource>();

  chunks.forEach((chunk) => {
    const web = chunk.web;
    if (!web?.uri) return;

    const source: GroundingSource = {
      title: web.title || 'Fonte oficial',
      uri: web.uri,
      snippet: web.snippet || web.description,
    };

    dedup.set(web.uri, source);
  });

  return Array.from(dedup.values());
};

const makeModelMessage = (text: string, extras?: Partial<ChatMessage>): ChatMessage => {
  return {
    id: `model-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role: 'model',
    text,
    createdAt: Date.now(),
    ...extras,
  };
};

const resolveApiKey = (): string => {
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
};

const historyToContents = (history: ChatMessage[], prompt: string) => {
  const recentHistory = history.slice(-8);

  const contents = recentHistory.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  return contents;
};

export const askGemini = async (prompt: string, history: ChatMessage[]): Promise<ChatMessage> => {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return makeModelMessage(
      'Chave de API nao configurada. Defina VITE_GEMINI_API_KEY no arquivo .env.local para habilitar consultas.',
      { isError: true },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await withTimeout(
      ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: historyToContents(history, prompt),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
        },
      }),
      TIMEOUT_MS,
    );

    const text = response.text?.trim() || 'Nao foi possivel gerar uma resposta para esta consulta.';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = normalizeSources(groundingMetadata);

    return makeModelMessage(text, {
      sources: sources.length ? sources : undefined,
    });
  } catch (error) {
    console.error('Gemini API error:', error);

    return makeModelMessage(
      'Falha ao consultar a IA no momento. Tente novamente em instantes ou ajuste o prompt para uma pergunta mais especifica.',
      { isError: true },
    );
  }
};
