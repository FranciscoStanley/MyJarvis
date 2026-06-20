# Skills MyJarvis

Cada **regra** em `.cursor/rules/` tem uma **skill** correspondente em `.cursor/skills/`.

> Diagramas de arquitetura: usar **Mermaid** (renderiza no GitHub). Referência: [docs/architecture.md](../docs/architecture.md)

| Regra | Skill | Quando usar |
|-------|-------|-------------|
| `project-architecture.mdc` | [project-architecture](project-architecture/SKILL.md) | Estrutura do monorepo, portas, gateway |
| `clean-architecture.mdc` | [clean-architecture](clean-architecture/SKILL.md) | Camadas domain/application/infrastructure |
| `solid-principles.mdc` | [solid-principles](solid-principles/SKILL.md) | SOLID, clean code, nomenclatura |
| `nestjs-services.mdc` | [nestjs-services](nestjs-services/SKILL.md) | Microserviços NestJS, Swagger, testes |
| `nextjs-frontend.mdc` | [nextjs-frontend](nextjs-frontend/SKILL.md) | Frontend jarvis-web, UI, PWA |
| `free-open-source-stack.mdc` | [free-open-source-stack](free-open-source-stack/SKILL.md) | Stack gratuito, Ollama, DuckDuckGo |
| `review-code.mdc` | [review-code](review-code/SKILL.md) | Code review, CI/CD 3 etapas, pre-push |
| `organize-commits.mdc` | [organize-commits](organize-commits/SKILL.md) | Commits atômicos, Conventional Commits |
| `dev-agent.mdc` | [dev-agent](dev-agent/SKILL.md) | Agente de codificação, review, refactor, skills/rules |
| `safety-guardrails.mdc` | [safety-guardrails](safety-guardrails/SKILL.md) | Ética, recusa de ataques, LGPD |
| `christian-faith.mdc` | [christian-faith](christian-faith/SKILL.md) | Fé evangélica batista, worldview JARVIS |
| `continuous-learning.mdc` | [continuous-learning](continuous-learning/SKILL.md) | Memória persistente, peer AIs |
| — | [myjarvis-development](myjarvis-development/SKILL.md) | Fluxo geral de desenvolvimento |

## Como funciona

- **Rules** (`.mdc`): contexto automático ou por glob — aplicadas pelo Cursor
- **Skills** (`SKILL.md`): guias detalhados — carregadas quando relevantes ao task

Ao implementar features, comece por `myjarvis-development` e carregue a skill específica do domínio.
