# Fiscal Intelligence Suite (Frontend)

Aplicacao frontend para inteligencia fiscal, com foco em exploracao de ICMS/FCP por UF, consulta municipal (ISS + cota-parte de ICMS), simulacao de cenarios e assistente de IA com grounding em fontes oficiais.

## 1. Visao geral do frontend

### Objetivo do produto
Entregar uma interface de analise fiscal moderna e escalavel para apoiar decisao executiva com boa usabilidade, alta clareza visual e operacao rapida.

### Publico-alvo
- Analistas tributarios
- Controladoria e planejamento financeiro
- Consultorias de financas publicas
- Gestores de arrecadacao

### Fluxos principais
1. Filtrar UFs por regiao, termo e favoritos.
2. Explorar indicadores por estado e acionar consultas guiadas.
3. Comparar duas UFs com diferencas de carga efetiva e fundos compensatorios.
4. Consultar municipio com prompt estruturado (ISS + cota-parte).
5. Rodar simulador de sensibilidade fiscal.
6. Usar o consultor IA e reaproveitar historico de consultas.

## 2. Stack e tecnologias

- React 19
- TypeScript (strict mode)
- Vite 6
- Gemini SDK (`@google/genai`)
- CSS customizado com design tokens
- Persistencia local via `localStorage`

## 3. Arquitetura frontend

```text
.
|-- App.tsx
|-- index.tsx
|-- index.html
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
|   |-- StateCard.tsx
|   `-- StateComparator.tsx
|-- vite-env.d.ts
`-- vite.config.ts
```

### Padrões aplicados
- Separacao por camada (UI, dominio, servicos, hooks, utilitarios).
- Componentizacao de alto reaproveitamento.
- Prompts centralizados em utilitario dedicado.
- Estado local minimalista e previsivel.

## 4. Analise tecnica e melhorias implementadas

### Diagnostico do frontend (antes)
- Acoplamento elevado no componente raiz.
- Falta de recursos de comparacao entre UFs.
- Ausencia de controles de acessibilidade de interface.
- Bundle inicial impactado por import estatico da SDK de IA.
- SEO basico no documento HTML.

### Refactor e otimizacoes (depois)
- Refatoracao estrutural com componentes especializados.
- `geminiService` otimizado com `import()` dinamico da SDK e cache de respostas.
- Filtro com debounce para reduzir recomputacoes.
- Consolidacao de design system com tokens e variaveis CSS.
- Melhorias de navegacao e fluxo (limpar filtros, comparador e reaproveitamento de consultas).

### Acessibilidade e UX
- Skip link para navegação por teclado.
- Estados de foco visiveis em controles interativos.
- `aria-live`, `aria-busy`, `role=status` no fluxo de chat.
- Controles de acessibilidade com persistencia:
  - Alto contraste
  - Layout compacto
  - Reducao de animacoes
- Suporte a `prefers-reduced-motion`.

### SEO frontend
- Metadados expandidos: `description`, `keywords`, `robots`, `theme-color`.
- Open Graph e Twitter Card.
- JSON-LD (`SoftwareApplication`).

## 5. Novas funcionalidades implementadas

1. Comparador de UFs (`StateComparator`)
- Compara ICMS, FCP/FECOP, carga efetiva e existencia de fundo compensatorio.
- Aciona prompt de comparacao diretamente no assistente IA.
- Valor: acelera diagnostico entre estados concorrentes.

2. Preferencias de acessibilidade persistentes
- Alto contraste, modo compacto e reducao de movimento.
- Valor: amplia inclusao, conforto visual e controle de interface.

3. Copia rapida de respostas da IA
- Botao de copia por mensagem do assistente.
- Valor: facilita reutilizacao em relatórios e pareceres.

4. Cache de consultas IA
- Reaproveita respostas recentes por prompt.
- Valor: melhora responsividade percebida e reduz custo de chamadas.

## 6. Setup e execucao

### Pre-requisitos
- Node.js 20+
- npm 10+

### Configuracao
1. Instalar dependencias:

```bash
npm install
```

2. Criar `.env.local` (base em `.env.example`):

```env
VITE_GEMINI_API_KEY=seu_token
VITE_GEMINI_MODEL=gemini-2.0-flash
```

3. Rodar localmente:

```bash
npm run dev
```

4. Validar tipos:

```bash
npm run typecheck
```

5. Build de producao:

```bash
npm run build
```

6. Preview da build:

```bash
npm run preview
```

## 7. Boas praticas adotadas

- TypeScript estrito para reduzir regressao.
- Tratamento de erro e timeout no servico de IA.
- Componentes orientados a responsabilidade unica.
- Tokens visuais centralizados para consistencia do design.
- Interface responsiva e sem dependencia de frameworks CSS externos.

## 8. Melhorias futuras

- Internacionalizacao (`i18n`) e formatação regional dinâmica.
- Testes unitarios (Vitest + Testing Library) e E2E (Playwright).
- Instrumentacao de performance web (Core Web Vitals).
- Worker para tarefas de processamento de prompts e caches offline.
- Exportacao de relatórios em PDF/CSV diretamente na UI.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
