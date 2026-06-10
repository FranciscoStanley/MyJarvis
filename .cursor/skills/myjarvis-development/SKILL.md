---
name: myjarvis-development
description: Guia de desenvolvimento do MyJarvis. Use ao implementar features, criar serviços, modificar APIs ou frontend. Cobre fluxo de trabalho, documentação obrigatória e arquitetura.
---

# MyJarvis Development Skill

## Fluxo ao Implementar Features

1. Identificar serviço(s) afetado(s)
2. Implementar seguindo Clean Architecture (domain → application → infrastructure → presentation)
3. Adicionar/atualizar testes Vitest
4. Atualizar Swagger decorators nos controllers
5. Atualizar `docs/postman/myjarvis.postman_collection.json`
6. Atualizar `docs/insomnia/myjarvis.insomnia.json`
7. Atualizar README do serviço e README raiz se necessário

## Comandos Úteis

```bash
# Subir infraestrutura
docker compose up -d

# Desenvolvimento individual
cd services/service-ai && npm run start:dev
cd frontends/jarvis-web && npm run dev

# Testes
npm run test          # raiz (todos)
npm run test:unit     # por serviço
```

## Personalidade JARVIS (service-ai)

System prompt deve incluir:
- Tom britânico elegante, inteligente, levemente irônico
- Proativo e prestativo como assistente pessoal
- Capaz de humor sutil quando apropriado
- Referências contextuais sem exagerar

## Integrações de Busca (service-search)

- Web: DuckDuckGo API / SerpAPI (configurável via env)
- Imagens: Unsplash API / SerpAPI Images
- Vídeos: YouTube Data API
- Música: Spotify Web API / YouTube Music

## Voz (service-voice + frontend)

- STT: Web Speech API no browser + fallback OpenAI Whisper
- TTS: Web Speech Synthesis + fallback OpenAI TTS
- Endpoint backend para processamento server-side quando necessário
