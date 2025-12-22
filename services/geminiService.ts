
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || "";

export const askGemini = async (prompt: string, history: ChatMessage[]): Promise<ChatMessage> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: `Você é um Consultor Fiscal de Elite e Especialista em Finanças Públicas Municipais e Estaduais no Brasil.
        
        SUA MISSÃO: Fornecer dados precisos e validados sobre a ARRECADAÇÃO DE ISS (Municípios) e ICMS (Estados) de 2018 a 2025.
        
        REGRAS MANDATÓRIAS DE CONTEÚDO:
        1. AO CONSULTAR ICMS ESTADUAL: Sempre inclua uma seção específica detalhando o Fundo de Combate à Pobreza (FCP/FECOP) do estado (alíquotas e base legal) e a existência de Fundos de Compensação por Benefícios Fiscais ou fundos de estabilização fiscal.
        2. FONTE DE VERDADE (GROUNDING): ACESSE prioritariamente: Siconfi (Tesouro Nacional), CONFAZ, Portal da Transparência, e sites de Secretarias de Fazenda (SEFAZ).
        3. DADOS MUNICIPAIS: Para municípios, procure pela série histórica de ISS e Repasses de Cota-Parte do ICMS (IPM).
        4. FORMATO: Use TABELAS comparativas anuais (2018 a 2025) para valores de arrecadação.
        5. PRECISÃO: Indique valores em Reais (R$), bilhões ou milhões. Deixe claro se os dados de 2024/2025 são parciais ou projeções orçamentárias (LOA).
        
        Sempre cite as URLs e os nomes dos relatórios consultados (ex: RREO - Relatório Resumido da Execução Orçamentária).`,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Desculpe, não consegui processar sua consulta fiscal municipal.";
    
    const sources: GroundingSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Fonte Governamental Oficial",
            uri: chunk.web.uri,
            snippet: chunk.web.snippet || chunk.web.description || undefined
          });
        }
      });
    }

    return {
      role: 'model',
      text: text,
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      role: 'model',
      text: "Erro na conexão com a base de dados fiscal municipal. Por favor, verifique sua conexão ou tente novamente."
    };
  }
};
