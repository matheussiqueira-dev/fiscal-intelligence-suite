# UX/UI Decisions - Fiscal Intelligence Suite

## 1. Contexto do produto

### Objetivo de negocio
A plataforma apoia decisoes fiscais com foco em velocidade analitica, confianca dos dados e rastreabilidade das consultas.

### Usuario principal
- Analista fiscal
- Lider de planejamento
- Consultor tributario

### Problema resolvido
Concentrar em uma unica experiencia: exploracao de UFs, comparacao de cenarios, consulta municipal e validacao com IA/fontes oficiais.

## 2. Friccoes identificadas

- Sobrecarga cognitiva com muitos blocos sem orientacao de jornada.
- Descoberta limitada de funcionalidades (comparacao, simulacao e assistente).
- Falta de controle visual para diferentes perfis de uso (visao detalhada vs. panoramica).
- Baixa previsibilidade de proximo passo para usuarios iniciantes.

## 3. Racional de UX aplicado

### Jornada guiada
Foi criado um bloco de roteiro (`WorkflowGuide`) com progresso de etapas para:
- explicitar o fluxo recomendado;
- reduzir abandono por indecisao;
- aumentar previsibilidade.

### Atalhos de navegacao por tarefa
A cabecalho agora inclui atalhos para seções criticas:
- Explorar UFs
- Laboratorio de Analise
- Assistente IA

Isso reduz tempo de deslocamento e melhora orientacao espacial da interface.

### Exploracao de dados mais eficiente
Foram adicionados:
- ordenacao analitica (nome, carga efetiva, FCP, fundo compensatorio);
- modo de visualizacao (grade/lista);
- pulso fiscal contextual.

Impacto: melhora o scanning e a comparabilidade de cenarios.

## 4. Racional de UI aplicado

### Direcao visual
- Linguagem limpa com atmosfera institucional (verde/teal + neutros claros).
- Tipografia com hierarquia forte (`Sora` para titulos e `IBM Plex Sans` para leitura).
- Cartoes e paineis com bordas e superfícies suaves para reforcar confianca.

### Hierarquia
- Header estrategico com resumo + atalhos.
- Jornada de decisao como camada de orientacao.
- Conteudo analitico em blocos com pesos claros.

### Microinteracoes
- hover com elevação leve em cards e atalhos.
- feedback de progresso na jornada.
- transicoes suaves em interacoes nao críticas.

## 5. Design System evoluido

### Tokens
- Cores semanticas: `accent`, `success`, `danger`, `border`, `surface`.
- Escala de raio e sombras reutilizavel.
- Variantes de tema:
  - alto contraste
  - compacto
  - reduzido movimento

### Componentes
- `StateCard`
- `KpiBoard`
- `WorkflowGuide`
- `StateComparator`
- `AIConsultant`

### Estados
- hover
- focus-visible
- selected
- disabled
- done/ativo (workflow)

## 6. Acessibilidade (WCAG)

- Skip link para conteudo principal.
- foco visivel e consistente em controles.
- navegacao por teclado preservada.
- controles de acessibilidade persistentes.
- suporte a `prefers-reduced-motion`.

## 7. Responsividade

- Desktop: layout em duas colunas com assistente em trilho lateral.
- Tablet: adaptacao por quebra de grid com preservacao de contexto.
- Mobile: simplificacao da densidade e fallback de lista em componentes complexos.

## 8. Diretrizes para engenharia

- Manter tokens em `styles.css` como fonte unica de verdade visual.
- Para novos componentes:
  - usar estrutura de painel (`panel`, `panel__header`) quando aplicavel;
  - respeitar estados de acessibilidade (focus, disabled, aria labels);
  - evitar cores fora do sistema sem justificativa.
- Preferir componentes puros, com estado no nivel de pagina/container.

## 9. Proximas evolucoes de UX/UI

- Dashboard de metas e alertas (thresholds configuraveis por usuario).
- Onboarding progressivo com tours contextuais.
- Exportacao visual de relatorios (snapshot em PDF).
- Tema institucional por tenant (white-label controlado).
