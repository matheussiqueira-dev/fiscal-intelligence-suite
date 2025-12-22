
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
        systemInstruction: `Você é um Analista de Finanças Públicas e Consultor Tributário Especialista (Senior). 
        Seu domínio inclui:
        1. Arrecadação Histórica de ICMS (2018-2025) por Estado.
        2. Arrecadação de ISS municipal e regras de competência.
        3. Distribuição de Cota-Parte do ICMS para municípios (Índice de Participação dos Municípios - IPM).
        4. Fundo de Combate à Pobreza (FCP) - alíquotas adicionais e aplicação.
        5. Fundo de Compensação por Benefícios Fiscais e incentivos (Guerra Fiscal).

        REGRAS DE RESPOSTA:
        - SEMPRE use a ferramenta de busca para verificar dados de arrecadação mais recentes em sites oficiais como CONFAZ, Tesouro Nacional (Siconfi), Portal da Transparência e sites de SEFAZ estaduais.
        - Se o usuário perguntar por um município específico, tente localizar os repasses de Cota-parte de ICMS ou arrecadação de ISS.
        - Apresente dados numéricos de forma organizada (tabelas se possível em Markdown).
        - Mencione explicitamente os sites oficiais de onde os dados foram extraídos.
        - Seja preciso sobre mudanças legislativas de 2024 e 2025.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Desculpe, não consegui processar sua pergunta.";
    
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Fonte Governamental",
            uri: chunk.web.uri
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
      text: "Ocorreu um erro ao consultar a inteligência financeira. Verifique sua conexão."
    };
  }
};
