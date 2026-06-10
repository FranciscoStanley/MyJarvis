# Testes MyJarvis

Suíte completa de testes automatizados.

## Tipos de Teste

| Tipo | Comando | Descrição |
|------|---------|-----------|
| **Unitários** | `npm run test:unit` | Use cases, adapters, stores, componentes |
| **Integração (in-process)** | `npm run test:integration` | Supertest + NestJS TestingModule |
| **Integração (live HTTP)** | `npm run test:live` | Requer `docker compose up` |
| **Performance** | `npm run test:performance` | Autocannon + benchmarks Vitest |
| **Stress** | `npm run test:stress` | 200+ conexões, burst load |
| **E2E** | `npm run test:e2e` | Playwright (frontend) |
| **K6** | `npm run test:k6:load` | Load test (requer [k6](https://k6.io)) |
| **Todos** | `npm run test:all` | Unit + integration in-process |

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

GitHub Actions (`.github/workflows/tests.yml`) executa `npm run test:all` em cada push/PR.

Testes unitários e integração in-process rodam **sem Docker**.
Testes live/performance/stress são skipped automaticamente se serviços estiverem offline.

### NestJS + Vitest

Serviços NestJS usam `@myjarvis/nest-vitest` para emitir metadata de decorators (DI) nos testes Vitest.
