# MyJarvis

Assistente de IA pessoal inspirado no **JARVIS** do Homem de Ferro — inteligente, com senso de humor, voz, buscas na internet, imagens, vídeos e músicas.

## Arquitetura

```
┌─────────────────┐     ┌──────────────────┐
│   jarvis-web    │────▶│  service-gateway  │ :3000
│  (Next.js PWA)  │     └────────┬─────────┘
└─────────────────┘              │
         :3100          ┌────────┼────────┬──────────┬────────────┐
                        ▼        ▼        ▼          ▼            ▼
                   auth:3001  ai:3002  voice:3003  search:3004  media:3006
                                              notifications:3005
```

- **Frontend**: Next.js 15 + Tailwind + PWA (web + mobile)
- **Backend**: 7 microserviços NestJS com Clean Architecture
- **IA**: OpenAI GPT-4o + Whisper + TTS
- **Busca**: DuckDuckGo, Unsplash, YouTube API

## Início Rápido

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- OpenAI API Key (recomendado)

### Setup

```bash
# Clonar e configurar
cp .env.example .env
# Edite .env com suas API keys

# Subir tudo com Docker
docker compose up -d --build

# Ou desenvolvimento local
npm install
npm run docker:up          # postgres + redis
npm run start:dev -w service-auth
npm run start:dev -w service-ai
npm run start:dev -w service-gateway
npm run dev -w jarvis-web
```

### URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3100 |
| API Gateway | http://localhost:3000/api |
| Swagger Gateway | http://localhost:3000/api/docs |
| Auth Swagger | http://localhost:3001/api/docs |
| AI Swagger | http://localhost:3002/api/docs |

## Microserviços

| Serviço | Porta | Responsabilidade |
|---------|-------|------------------|
| `service-gateway` | 3000 | API Gateway, roteamento |
| `service-auth` | 3001 | Autenticação JWT |
| `service-ai` | 3002 | Cérebro JARVIS (LLM + tools) |
| `service-voice` | 3003 | STT/TTS (Whisper + OpenAI TTS) |
| `service-search` | 3004 | Web, imagens, vídeos, música |
| `service-notifications` | 3005 | Notificações push |
| `service-media` | 3006 | Reprodução de mídia |

## Testes

```bash
npm test                    # Todos os workspaces
npm run test -w service-ai  # Serviço específico
npm run test -w jarvis-web  # Frontend
```

## Documentação

- [Arquitetura](docs/architecture.md)
- [API Reference](docs/api.md)
- [Postman Collection](docs/postman/myjarvis.postman_collection.json)
- [Insomnia Collection](docs/insomnia/myjarvis.insomnia.json)

## Variáveis de Ambiente

Veja [.env.example](.env.example) para a lista completa.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `OPENAI_API_KEY` | Recomendada | IA, voz e personalidade completa |
| `JWT_SECRET` | Sim (prod) | Secret para tokens JWT |
| `DATABASE_URL` | Sim | PostgreSQL connection string |
| `YOUTUBE_API_KEY` | Opcional | Busca de vídeos real |
| `UNSPLASH_ACCESS_KEY` | Opcional | Busca de imagens real |

## Regras de Desenvolvimento

Consulte `.cursor/rules/` para padrões de Clean Architecture, SOLID e convenções do projeto.

**Ao alterar funcionalidades**, sempre atualize:
1. Swagger decorators nos controllers
2. Testes Vitest
3. Collections Postman/Insomnia
4. Documentação em `docs/`

## Licença

MIT
