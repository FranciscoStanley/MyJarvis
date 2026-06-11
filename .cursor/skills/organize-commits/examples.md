# Exemplos — Organize Commits (MyJarvis)

## Cenário A: Nova feature no service-ai + frontend

**Arquivos alterados:** use case, controller, adapter Ollama, store Zustand, componente ChatPanel, testes, Swagger implícito no controller, `docs/api.md`.

| # | Commit |
|---|--------|
| 1 | `feat(ai): adiciona use case de busca contextual no chat` — só `services/service-ai/src/` (domain, application, infra) |
| 2 | `feat(web): exibe resultados de busca no ChatPanel` — `frontends/jarvis-web/src/components/` |
| 3 | `test(ai): integração do chat com search mockado` — `services/service-ai/test/` |
| 4 | `test(web): unitários do ChatPanel com resultados` — `*.spec.tsx` |
| 5 | `docs(api): documenta campo searchResults na resposta do chat` — `docs/api.md` |

---

## Cenário B: Bugfix + refactor acidental

**Situação:** corrigiu proxy no gateway e renomeou variáveis em 3 arquivos.

| # | Commit |
|---|--------|
| 1 | `refactor(gateway): renomeia variáveis no ProxyService` — se refactor for independente |
| 2 | `fix(gateway): repassa header Authorization ao encaminhar para auth` — só a linha do fix |

Se o refactor for pré-requisito do fix, um único commit: `fix(gateway): corrige repasse de Authorization no proxy`.

---

## Cenário C: Skill Cursor + CI + README

| # | Commit |
|---|--------|
| 1 | `ci: adiciona workflow em três etapas e hook pre-push` — `.github/`, `.husky/`, `scripts/ci/`, scripts no `package.json` raiz |
| 2 | `cursor: adiciona skill review-code e rule correspondente` — `.cursor/skills/review-code/`, `.cursor/rules/review-code.mdc` |
| 3 | `docs: documenta pipeline CI em testing.md e README` — `docs/testing.md`, `README.md` |

---

## Cenário D: Dependência nova em vários workspaces

| # | Commit |
|---|--------|
| 1 | `chore(deps): adiciona @myjarvis/nest-vitest para testes NestJS` — `packages/nest-vitest/`, `package-lock.json`, `package.json` dos services |
| 2 | `test(ai): configura vitest com decorator metadata` — `services/service-ai/vitest.config.ts` |
| 3 | `test(auth): configura vitest com decorator metadata` — idem auth |

---

## Cenário E: Tudo misturado (anti-padrão → correção)

**Diff atual:** service-search fix + jarvis-web UI + README + package-lock

**Errado:** um commit "várias alterações"

**Certo:**

```
fix(search): normaliza limite padrão na busca de imagens
feat(web): adiciona indicador de loading no InputBar
docs: atualiza seção de testes no README
chore(deps): sincroniza package-lock após npm install
```

---

## Comandos úteis para separar

```bash
# Adicionar hunks específicos de um arquivo
git add -p services/service-gateway/src/application/proxy.service.ts

# Commit só de alguns arquivos
git add services/service-ai/src/ services/service-ai/test/
git commit -m "feat(ai): ..."

# Ver o que falta commitar
git status -sb

# Desfazer stage sem perder alterações
git restore --staged .
```
