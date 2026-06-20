---
name: project-architecture
description: Arquitetura geral do MyJarvis — monorepo, microserviços, gateway, portas e convenções. Use ao criar serviços, definir estrutura de pastas, configurar Docker ou documentar arquitetura com Mermaid.
---

# Project Architecture — MyJarvis

Skill correspondente à regra `.cursor/rules/project-architecture.mdc`.

> **Diagramas**: usar Mermaid em docs e README — renderiza nativamente no GitHub.

## Visão do Sistema

```mermaid
flowchart TB
    USER((Usuário)) --> WEB[jarvis-web :3100]
    WEB --> GW[service-gateway :3000]

    GW --> AUTH[service-auth :3001]
    GW --> AI[service-ai :3002]
    GW --> VOICE[service-voice :3003]
    GW --> SEARCH[service-search :3004]
    GW --> NOTIF[service-notifications :3005]
    GW --> MEDIA[service-media :3006]

    AI --> OLLAMA[(Ollama :11434<br/>chat + RAG 45 chunks)]
    VOICE --> PIPER[(Piper :5000)]
    AUTH --> PG[(PostgreSQL)]
    SEARCH --> EXT[DuckDuckGo · Wikimedia · Archive.org]
```

Documentação completa: [docs/architecture.md](../../../docs/architecture.md)

## Monorepo

```mermaid
flowchart TB
    ROOT[MyJarvis/]
    ROOT --> CURSOR[".cursor/rules + skills"]
    ROOT --> SERVICES["services/ — 7 microserviços"]
    ROOT --> FRONTENDS["frontends/jarvis-web"]
    ROOT --> PACKAGES["packages/<br/>shared · nest-auth · nest-security · nest-vitest"]
    ROOT --> DOCS["docs/ + docker-compose.yml"]
```

## Regras Obrigatórias

- Cada microserviço é independente: `package.json`, Dockerfile, testes próprios
- Comunicação entre serviços via HTTP REST (ou Redis/RabbitMQ no futuro)
- **Gateway** (`service-gateway`) é o único ponto de entrada externo
- Frontend consome **apenas** o Gateway — nunca serviços internos diretamente
- Secrets em `.env` — nunca commitar credenciais
- Ao alterar arquitetura: atualizar Mermaid em `docs/architecture.md` e README

## Portas Padrão

| Serviço | Porta |
|---------|-------|
| service-gateway | 3000 |
| service-auth | 3001 |
| service-ai | 3002 |
| service-voice | 3003 |
| service-search | 3004 |
| service-notifications | 3005 |
| service-media | 3006 |
| jarvis-web | 3100 |
| Ollama | 11434 |
| Piper TTS | 5000 |

## Skills Relacionadas

- [clean-architecture](clean-architecture/SKILL.md)
- [nestjs-services](nestjs-services/SKILL.md)
- [nextjs-frontend](nextjs-frontend/SKILL.md)
- [free-open-source-stack](free-open-source-stack/SKILL.md)
- [myjarvis-development](myjarvis-development/SKILL.md)
