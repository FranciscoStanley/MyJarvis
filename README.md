# MyJarvis

Assistente de IA pessoal inspirado no **JARVIS** — inteligente, com humor, voz, buscas na internet, imagens, vídeos e músicas.

**100% gratuito e open source** — sem APIs pagas, sem licenças comerciais.

## Stack Gratuito

| Componente | Tecnologia | Licença |
|------------|-----------|---------|
| IA | Ollama + Llama 3.2 | MIT |
| Busca | DuckDuckGo, Wikimedia, Internet Archive | MIT / CC |
| Voz | Web Speech API (navegador) | W3C |
| Backend | NestJS | MIT |
| Frontend | Next.js PWA | MIT |

Detalhes: [docs/free-stack.md](docs/free-stack.md)

## Arquitetura

```
┌─────────────────┐     ┌──────────────────┐
│   jarvis-web    │────▶│  service-gateway  │ :3000
│  (Next.js PWA)  │     └────────┬─────────┘
└─────────────────┘              │
         :3100          ┌────────┼────────┬──────────┬────────────┐
                        ▼        ▼        ▼          ▼            ▼
                   auth:3001  ai:3002  voice:3003  search:3004  media:3006
                              Ollama              DuckDuckGo
                                              notifications:3005
```

## Início Rápido

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- ~4 GB RAM livre (para Ollama)

### Setup

```bash
cp .env.example .env

# Subir infraestrutura + serviços
docker compose up -d --build

# Baixar modelo de IA (primeira vez)
docker compose exec ollama ollama pull llama3.2
```

### URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3100 |
| API Gateway | http://localhost:3000/api |
| Ollama | http://localhost:11434 |

## Microserviços

| Serviço | Porta | Tecnologia gratuita |
|---------|-------|---------------------|
| `service-ai` | 3002 | Ollama (LLM local) |
| `service-search` | 3004 | DuckDuckGo + Wikimedia + Archive.org |
| `service-voice` | 3003 | Web Speech API (via frontend) |
| Demais | — | NestJS + PostgreSQL + Redis |

## Testes

```bash
npm test
```

## Documentação

- [Stack gratuito](docs/free-stack.md)
- [Arquitetura](docs/architecture.md)
- [API Reference](docs/api.md)
- [Postman](docs/postman/myjarvis.postman_collection.json)

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `OLLAMA_BASE_URL` | URL do Ollama (padrão: http://localhost:11434) |
| `OLLAMA_MODEL` | Modelo local (padrão: llama3.2) |
| `JWT_SECRET` | Secret JWT (produção) |
| `DATABASE_URL` | PostgreSQL |

## Licença

MIT
