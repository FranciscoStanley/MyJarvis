---
name: myjarvis-development
description: Guia de desenvolvimento do MyJarvis. Use ao implementar features, criar serviços, modificar APIs ou frontend. Stack 100% gratuito e open source.
---

# MyJarvis Development Skill

## Stack Gratuito (obrigatório)

- **IA**: Ollama + Llama/Mistral (local, MIT) — nunca OpenAI pago
- **Busca**: DuckDuckGo, Wikimedia, Internet Archive
- **Voz**: Web Speech API no browser (STT + TTS)
- Ver `docs/free-stack.md` antes de adicionar dependências

## Fluxo ao Implementar Features

1. Identificar serviço(s) afetado(s)
2. Confirmar que a tecnologia é gratuita/open source
3. Implementar Clean Architecture (domain → application → infrastructure → presentation)
4. Atualizar testes Vitest, Swagger, Postman, Insomnia, README

## Comandos

```bash
docker compose up -d
docker compose exec ollama ollama pull llama3.2
npm run start:dev -w service-ai
npm run dev -w jarvis-web
npm test
```

## Personalidade JARVIS (service-ai)

System prompt via Ollama — tom britânico elegante, inteligente, humor sutil.

## Integrações de Busca (service-search)

- Web: DuckDuckGo Instant Answer + duck-duck-scrape
- Imagens: duck-duck-scrape + Wikimedia Commons API
- Vídeos: duck-duck-scrape videos
- Música: Internet Archive advancedsearch

## Voz (frontend + service-voice)

- STT/TTS no navegador (Web Speech API) — gratuito
- Backend voice retorna metadados `clientSide: true` para TTS
