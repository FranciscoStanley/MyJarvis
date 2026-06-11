# Configuração global Cursor

As convenções de **rules + skills** deste projeto também estão salvas globalmente para novos repositórios.

**Autor:** Francisco Stanley Rodrigues Albuquerque

## Global (todos os projetos)

| Local | Conteúdo |
|-------|----------|
| `~/.cursor/rules/cursor-project-bootstrap.mdc` | Rule always-on — dispara bootstrap em projetos novos |
| `~/.cursor/skills/bootstrap-cursor-project/` | Skill + templates scaffold |
| `~/.cursor/skills/organize-commits/` | Commits atômicos |
| `~/.cursor/skills/review-code/` | Review + CI |
| `~/.cursor/skills/solid-principles/` | SOLID |
| `~/.cursor/skills/clean-architecture/` | Camadas |
| `~/.cursor/skills/nestjs-services/` | NestJS |
| `~/.cursor/skills/nextjs-frontend/` | Next.js |

Índice global: `~/.cursor/skills/README.md`

## Neste repositório (MyJarvis)

Rules e skills **específicas** em `.cursor/rules/` e `.cursor/skills/` — ver [README.md](README.md).

## Novo projeto

Abra a pasta no Cursor e peça:

> *"Inicialize rules e skills do Cursor conforme a stack"*

O agente detecta NestJS/Next.js/monorepo e cria `.cursor/` adaptado.
