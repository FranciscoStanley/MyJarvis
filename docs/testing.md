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
| **Unitários** | `npm run test:unit` | Use cases, adapters, RAG, stores, componentes |
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
├── *.spec.ts                   # Unitários (RAG, action-detector, doc-search)
├── integration/*.integration.spec.ts
└── performance/*.performance.spec.ts  (service-ai)
frontends/jarvis-web/
├── src/**/*.spec.ts(x)         # Componentes, store, client-actions
└── e2e/*.spec.ts               # Playwright E2E (auto-execução mockada)
packages/shared/src/            # constants.spec.ts — TERMS_VERSION, hasAcceptedCurrentTerms
```

### Cobertura auth e termos (service-auth + shared + live)

| Arquivo | O que testa |
|---------|-------------|
| `services/service-auth/test/auth.use-cases.spec.ts` | Registro com `acceptTerms`; rejeição sem aceite; `AcceptTermsUseCase` |
| `services/service-auth/test/integration/auth.integration.spec.ts` | Register, login, `POST /accept-terms`, rejeição sem termos |
| `packages/shared/src/constants.spec.ts` | `TERMS_VERSION`, `hasAcceptedCurrentTerms()` |
| `tests/integration/gateway.live.spec.ts` | Register com `acceptTerms: true`, login e chat (requer Docker) |

### Cobertura RAG, dev agent e segurança (service-ai)

| Arquivo | O que testa |
|---------|-------------|
| `test/learning.spec.ts` | Validator, extractor, file-learning-store, filtro ético |
| `test/ollama-rag.adapter.spec.ts` | Retrieve; chunks ação + dev + ética + fé + PM |
| `test/doc-search.spec.ts` | `buildDocSearchQuery`, `doc-registry`, tecnologias suportadas |
| `test/action-detector.spec.ts` | YouTube, Google, docs, segurança; word boundaries (`\bsom\b`) |
| `test/action-intent.spec.ts` | Execução imediata vs confirmação |
| `test/client-action-builder.spec.ts` | `clientActions` + `requiresConfirmation` |
| `test/chat.use-cases.spec.ts` | Fluxo completo + confirmação sim/não |

### Cobertura frontend (jarvis-web)

| Arquivo | O que testa |
|---------|-------------|
| `src/lib/client-actions.spec.ts` | `window.open`, `executeClientActions`, TTS strip |
| `src/stores/jarvis.store.spec.ts` | Auto-execução de `clientActions`; erros amigáveis |
| `src/components/jarvis/ChatPanel.spec.tsx` | Renderização do painel de chat |
| `e2e/home.spec.ts` | Chat com resposta e ações mockadas |

**Termos de uso no frontend:** gate em `page.tsx` (`needsTermsAcceptance`) e `TermsAcceptModal` — validados manualmente ou via E2E futuro com mock de perfil sem aceite.

### Cobertura voz (service-voice)

| Arquivo | O que testa |
|---------|-------------|
| `test/piper-voice.adapter.spec.ts` | Síntese Piper WAV + fallback browser |
| `test/voice.use-cases.spec.ts` | Use cases transcribe/synthesize |
| `test/integration/voice.integration.spec.ts` | Endpoints HTTP |

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

Branch protection em `master`: exigir os 3 status checks + pull request (ver `.cursor/skills/review-code/ci-stages.md`).

Local: Husky `pre-push` roda `npm run ci:pipeline`.

Testes live/performance/stress são skipped automaticamente se serviços estiverem offline.

## Contagens de referência (última suíte verde)

| Pacote | Testes |
|--------|--------|
| `@myjarvis/shared` | 8 |
| `service-auth` | 4+ |
| `service-ai` | 61+ |
| `jarvis-web` | 16+ |
