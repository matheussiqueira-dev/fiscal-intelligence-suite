# Fiscal Intelligence Suite - Backend

Backend modular para analise fiscal (ICMS, FCP/FECOP, ISS e cota-parte de ICMS) com API REST versionada, autenticacao JWT, validacao forte de dados, trilha de auditoria e integracao opcional com Gemini.

## 1. Visao geral do backend

### Dominio de negocio
O backend atende fluxos de inteligencia fiscal para:
- consulta de perfis tributarios por UF;
- simulacao de cenarios de arrecadacao;
- analises assistidas por IA (estado, municipio, comparacao e chat livre);
- rastreio de historico de consultas para auditoria operacional.

### Publico-alvo
- equipes de planejamento fiscal;
- consultorias tributarias;
- controladoria e governanca publica;
- liderancas tecnicas que precisam de API segura e escalavel.

## 2. Arquitetura adotada

Arquitetura: **monolito modular** (Fastify + TypeScript), com separacao por camadas:
- `config`: configuracao de ambiente e politicas;
- `core`: erros de dominio, validacao, contrato de resposta;
- `modules`: regras de negocio por contexto (`auth`, `fiscal`, `queries`);
- `infrastructure`: persistencia (`JsonStore`);
- `plugins`: seguranca, autenticacao e metricas.

Padroes aplicados:
- SRP e baixo acoplamento entre servicos;
- DRY em validacoes e auditoria;
- contratos de resposta padronizados (`ok`/`fail`);
- endpoint versionado (`/api/v1`).

## 3. Analise tecnica do backend

### Situacao inicial
O repositório nao possuia backend implementado.

### Principais riscos que seriam esperados sem backend
- exposicao de chaves sensiveis no cliente;
- ausencia de autenticacao/autorizacao centralizada;
- falta de trilha de auditoria e monitoramento;
- ausencia de contratos de API e tratamento robusto de erro.

### Solucao implementada
Foi construido um backend completo em `backend/` com:
- autenticacao JWT + RBAC;
- validacao Zod para query/body/params;
- plugin de seguranca (CORS, Helmet, rate limit);
- logs estruturados e metricas operacionais;
- trilha de consultas persistida em arquivo;
- documentacao OpenAPI.

## 4. Tecnologias utilizadas

- Node.js 20+
- TypeScript (strict)
- Fastify
- Zod
- JSON Web Token (`jsonwebtoken`)
- `bcryptjs`
- `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`
- `@fastify/swagger`, `@fastify/swagger-ui`
- `@google/genai` (integracao opcional)
- Vitest

## 5. API e contratos

Base URL local: `http://localhost:4000/api/v1`

### Endpoints principais
- `GET /health` - status da aplicacao.
- `POST /auth/login` - login e emissao de token.
- `GET /auth/me` - perfil do usuario autenticado.
- `GET /states` - lista de estados com filtros.
- `GET /states/:uf` - detalhes de uma UF.
- `GET /insights/risk-ranking` - ranking de risco fiscal.
- `POST /scenarios/simulate` - simulacao de arrecadacao.
- `POST /analysis/state` - analise estadual com IA.
- `POST /analysis/municipal` - analise municipal com IA.
- `POST /analysis/compare` - comparacao entre UFs com IA.
- `POST /analysis/chat` - consulta livre orientada por IA.
- `GET /queries` - historico de consultas (usuario/admin).
- `DELETE /queries/:id` - remocao de item do historico.
- `GET /metrics` - metricas (somente admin).
- `GET /docs` - Swagger UI.

### Padrao de resposta
- Sucesso: `{ success: true, data, meta? }`
- Erro: `{ success: false, error: { code, message, details? } }`

## 6. Seguranca e confiabilidade

Implementacoes entregues:
- autenticacao JWT (`Bearer`);
- autorizacao por role (`admin`, `analyst`, `viewer`);
- hashing de senha com `bcryptjs`;
- validacao estrita de entrada com Zod;
- CORS whitelist configuravel via env;
- headers de seguranca com Helmet;
- rate limiting global por IP;
- tratamento global de excecoes com codigos de erro coerentes;
- logs estruturados com redacao de dados sensiveis.

Observacao: CSRF foi mitigado por arquitetura stateless baseada em token via header (sem cookie de sessao).

## 7. Performance e escalabilidade

Melhorias aplicadas:
- Fastify como runtime de alta performance;
- cache em memoria para respostas de IA repetidas;
- persistencia com escrita serializada para evitar corrupcao de arquivo;
- limites de payload e rate limit para reduzir abuso;
- endpoint de metricas para observabilidade operacional.

## 8. Estrutura do projeto backend

```text
backend/
|-- data/
|   `-- store.json
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- config/
|   |   `-- env.ts
|   |-- core/
|   |   |-- errors.ts
|   |   |-- response.ts
|   |   `-- validation.ts
|   |-- domain/
|   |   `-- types.ts
|   |-- infrastructure/
|   |   `-- store/
|   |       `-- jsonStore.ts
|   |-- modules/
|   |   |-- auth/
|   |   |   |-- auth.routes.ts
|   |   |   |-- auth.schemas.ts
|   |   |   |-- auth.service.ts
|   |   |   `-- user.repository.ts
|   |   |-- fiscal/
|   |   |   |-- fiscal.constants.ts
|   |   |   |-- fiscal.routes.ts
|   |   |   |-- fiscal.schemas.ts
|   |   |   `-- fiscal.service.ts
|   |   `-- queries/
|   |       |-- query.repository.ts
|   |       |-- query.routes.ts
|   |       `-- query.service.ts
|   `-- plugins/
|       |-- auth.ts
|       |-- metrics.ts
|       `-- security.ts
|-- test/
|   `-- fiscal.service.test.ts
|-- .env.example
|-- package.json
`-- tsconfig.json
```

## 9. Setup e execucao

### Pre-requisitos
- Node.js 20+
- npm 10+

### Passo a passo
1. Entrar na pasta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Criar `.env` a partir de `.env.example`.

4. Rodar em desenvolvimento:
```bash
npm run dev
```

5. Validar tipos:
```bash
npm run typecheck
```

6. Rodar testes:
```bash
npm run test
```

7. Build de producao:
```bash
npm run build
```

8. Executar build:
```bash
npm run start
```

## 10. Boas praticas e padroes

- Camadas desacopladas por responsabilidade.
- Contratos de API previsiveis e versionados.
- Falhas tratadas centralmente com codigos de erro.
- Seguranca por padrao (headers, rate limit, validacao).
- Preparado para evolucao para banco relacional sem quebrar casos de uso (repositorios isolados).

## 11. Melhorias futuras

- Migracao de persistencia para PostgreSQL (com migrations e indices).
- Refresh token e rotacao de credenciais.
- Observabilidade completa com tracing distribuido (OpenTelemetry).
- Feature flags para experimentos de estrategias analiticas.
- Contract tests e testes E2E de API.
- Webhooks/event bus para integracoes externas.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
