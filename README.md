# Fiscal Intelligence Suite

Plataforma web para analise tributaria estadual e municipal no Brasil, com foco em ICMS, FCP/FECOP, ISS e cota-parte de ICMS. O sistema combina exploracao de dados estruturados por UF com um consultor de IA apoiado por fontes oficiais.

## Visao geral do projeto

O produto foi desenhado para times de financas publicas, consultorias, controladoria e planejamento estrategico que precisam:

- mapear rapidamente aliquotas por estado;
- priorizar UFs com fundos de compensacao ativos;
- conduzir consultas municipais com rastreabilidade;
- acelerar analises com apoio de IA e grounding em fontes oficiais.

## Fluxo principal

1. Filtrar estados por regiao, busca textual e favoritos.
2. Selecionar uma UF para ver indicadores e acionar analises guiadas.
3. Rodar consultas municipais (ISS + cota-parte de ICMS).
4. Validar respostas no painel de IA com links de fontes.
5. Reaproveitar prompts no historico de consultas.
6. Testar sensibilidade fiscal no simulador de cenario.

## Tecnologias utilizadas

- React 19 + TypeScript
- Vite
- Gemini API (`@google/genai`)
- CSS customizado com design system (tokens, responsividade e acessibilidade)

## Funcionalidades principais

- Explorer de UFs com filtros por regiao, busca e favoritos persistidos em `localStorage`.
- Indicadores executivos (cobertura filtrada, media ICMS/FCP, fundos ativos).
- Painel de detalhes por estado com atalhos para prompts estrategicos.
- Consulta municipal guiada para serie historica com foco em fontes oficiais.
- Assistente fiscal com IA:
  - conversa contextual com historico recente;
  - timeout e tratamento de erro;
  - extracao e deduplicacao de fontes.
- Historico de prompts reutilizavel e persistente.
- Simulador de cenario fiscal (analise de sensibilidade de aliquotas).

## Instalacao e uso

### Pre-requisitos

- Node.js 20+
- npm 10+

### Passos

1. Instale dependencias:

```bash
npm install
```

2. Crie o arquivo `.env.local` com base em `.env.example`:

```env
VITE_GEMINI_API_KEY=seu_token
VITE_GEMINI_MODEL=gemini-2.0-flash
```

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. Validar tipos:

```bash
npm run typecheck
```

5. Gerar build de producao:

```bash
npm run build
```

## Scripts disponiveis

- `npm run dev`: inicia ambiente local.
- `npm run typecheck`: validacao estrita de tipos.
- `npm run build`: build de producao.
- `npm run preview`: preview local do build.

## Estrutura do projeto

```text
.
|-- App.tsx
|-- index.tsx
|-- styles.css
|-- constants.ts
|-- types.ts
|-- hooks/
|   |-- useDebouncedValue.ts
|   `-- useLocalStorage.ts
|-- utils/
|   |-- formatters.ts
|   `-- prompts.ts
|-- services/
|   `-- geminiService.ts
|-- components/
|   |-- AIConsultant.tsx
|   |-- KpiBoard.tsx
|   |-- QueryHistory.tsx
|   |-- ScenarioSimulator.tsx
|   `-- StateCard.tsx
`-- vite.config.ts
```

## Boas praticas aplicadas

- Separacao de responsabilidades por camada (UI, dominio, hooks, servicos, utilitarios).
- Variaveis de ambiente com prefixo `VITE_` e tipagem em `vite-env.d.ts`.
- Tratamento robusto de falhas na IA (timeout, erro de chave, fallback de resposta).
- Persistencia local para melhorar continuidade de uso (favoritos e historico).
- Foco em acessibilidade:
  - labels explicitas;
  - foco visivel;
  - elementos semanticos;
  - contraste consistente.
- CSS com tokens para manter consistencia visual e facilitar evolucao.

## Analise tecnica e melhorias realizadas

- Problemas identificados no estado inicial:
  - UI altamente acoplada ao componente principal;
  - dependencia de CDN para estilo/icones;
  - configuracao de API insegura e fraca para escala;
  - falta de persistencia para fluxos criticos;
  - README incompleto para operacao real.
- Melhorias executadas:
  - refatoracao arquitetural e componentizacao;
  - novo design system e refactor completo de UI/UX;
  - implementacao de features de negocio (favoritos, historico, simulador, KPIs);
  - endurecimento tecnico (typecheck estrito e servico de IA resiliente).

## Possiveis melhorias futuras

- Login e workspace multiusuario com controle de acesso por perfil.
- Camada de observabilidade (telemetria, tracing e auditoria de prompts).
- Cache inteligente de respostas para reduzir custo de IA.
- Testes automatizados (unitarios e E2E) com cobertura minima por modulo.
- Integracao com ETL oficial para ingestao periodica de dados fiscais.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
