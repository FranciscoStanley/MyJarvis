---
name: free-open-source-stack
description: Stack 100% gratuito do MyJarvis — Ollama, DuckDuckGo, Wikimedia, Internet Archive, Web Speech API. Use ao adicionar dependências, integrações ou validar que nenhuma API paga é necessária.
---

# Stack Gratuito — Sem Licenças Pagas

Skill correspondente à regra `.cursor/rules/free-open-source-stack.mdc`.

Documentação completa: [docs/free-stack.md](../../docs/free-stack.md)

## Mapa do Stack

```mermaid
flowchart TB
    WEB[jarvis-web] --> GW[gateway]
    WEB --> SPEECH[Web Speech API]

    GW --> AI[service-ai] --> OLLAMA[(Ollama)]
    GW --> SEARCH[service-search] --> DDG[DuckDuckGo · Wikimedia · Archive.org]
    GW --> AUTH[service-auth] --> PG[(PostgreSQL)]
```

## Proibido Adicionar

- OpenAI, Anthropic, Google Gemini API (pagos por token)
- SerpAPI, Bing Search API (pagos)
- Unsplash, YouTube Data API, Spotify como dependência **obrigatória**
- Qualquer SDK que exija chave comercial paga

## Matriz Gratuita (usar sempre)

| Necessidade | Solução | Licença |
|-------------|---------|---------|
| IA / Chat | Ollama + Llama 3.2 | MIT |
| Busca web | DuckDuckGo + duck-duck-scrape | MIT |
| Imagens | DuckDuckGo + Wikimedia Commons | MIT / CC |
| Vídeos | DuckDuckGo Videos | MIT |
| Música | Internet Archive | Domínio público |
| STT | Web Speech API (browser) | W3C |
| TTS | Web Speech Synthesis (browser) | W3C |
| Backend | NestJS | MIT |
| Frontend | Next.js | MIT |
| DB | PostgreSQL | PostgreSQL License |

## Ollama (IA local)

```bash
docker compose up -d ollama
docker compose exec ollama ollama pull llama3.2
```

Variáveis:
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_MODEL=llama3.2`

Adapter: `services/service-ai/src/infrastructure/adapters/ollama.adapter.ts`

## Checklist ao Integrar Nova Feature

1. [ ] Licença verificada (MIT, Apache 2.0, BSD ou domínio público)
2. [ ] Sem API key paga obrigatória
3. [ ] Documentado em `docs/free-stack.md`
4. [ ] `.env.example` sem vars de serviços pagos
5. [ ] Regra `.cursor/rules/free-open-source-stack.mdc` respeitada

## Onde Está no Código

| Serviço | Adapter / Implementação |
|---------|-------------------------|
| service-ai | `OllamaAdapter` |
| service-search | `FreeSearchAdapter` (duck-duck-scrape) |
| service-voice | `FreeVoiceAdapter` (clientSide TTS/STT) |
| jarvis-web | `useVoice.ts` (Web Speech API) |

## Skills Relacionadas

- [myjarvis-development](myjarvis-development/SKILL.md)
- [nestjs-services](nestjs-services/SKILL.md)
