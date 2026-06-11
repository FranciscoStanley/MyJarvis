# Testes MyJarvis

Suíte completa de testes automatizados.

## CI/CD — Pipeline em 3 Etapas

| Etapa | Comando | CI (GitHub) |
|-------|---------|-------------|
| 1 Validate | `npm run ci:stage1` | `Stage 1 — Validate` |
| 2 Build & Integration | `npm run ci:stage2` | `Stage 2 — Build & Integration` |
| 3 E2E & Quality | `npm run ci:stage3` | `Stage 3 — E2E & Quality Gate` |

```bash
npm run ci:pipeline   # Local + pre-push hook (Husky)
```

Workflow: `.github/workflows/ci.yml` — jobs encadeados; merge bloqueado se alguma etapa falhar.

Code review: `.cursor/skills/review-code/SKILL.md`

## Tipos de Teste

| Tipo | Comando | Descrição |
|------|---------|-----------|
| **Unitários** | `npm run test:unit` | Use cases, adapters, stores, componentes |
| **Integração (in-process)** | `npm run test:integration` | Supertest + NestJS TestingModule |
| **Integração (live HTTP)** | `npm run test:live` | Requer `docker compose up` |
| **Performance** | `npm run test:performance` | Autocannon + benchmarks Vitest |
| **Stress** | `npm run test:stress` | 200+ conexões, burst load |
| **E2E** | `npm run test:e2e -w jarvis-web` | Playwright (frontend, porta 3110) |
| **K6** | `npm run test:k6:load` | Load test (requer [k6](https://k6.io)) |
| **Todos** | `npm run test:all` | Unit + integration in-process |

## E2E (Playwright)

```bash
npm run test:e2e -w jarvis-web
# Porta padrão do servidor de teste: 3110 (evita conflito com dev na 3100)
PLAYWRIGHT_PORT=3120 npm run test:e2e -w jarvis-web
```

Os testes E2E mockam a API do gateway — não exigem Docker.

## Estrutura

```
tests/                          # Cross-service: live, perf, stress, k6
services/*/test/
├── *.spec.ts                   # Unitários
├── integration/*.integration.spec.ts
└── performance/*.performance.spec.ts  (service-ai)
frontends/jarvis-web/
├── src/**/*.spec.tsx           # Componentes
└── e2e/*.spec.ts               # Playwright E2E
```

## Pré-requisitos

```bash
npm install

# Testes live / performance / stress (serviços rodando)
docker compose up -d --build
```

## K6 (opcional)

```bash
# Instalar k6: https://k6.io/docs/get-started/installation/
cd tests
npm run test:k6:load
npm run test:k6:stress
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) executa as **3 etapas encadeadas** em cada push/PR.

Branch protection em `main`: exigir os 3 status checks (ver `.cursor/skills/review-code/ci-stages.md`).

Local: Husky `pre-push` roda `npm run ci:pipeline`.

Testes live/performance/stress são skipped automaticamente se serviços estiverem offline.
