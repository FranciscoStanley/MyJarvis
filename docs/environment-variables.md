# Variáveis de Ambiente

Referência das variáveis de configuração do MyJarvis.

> **Fonte canônica:** este arquivo em `docs/environment-variables.md`. A [wiki GitHub](https://github.com/FranciscoStanley/MyJarvis/wiki/Environment-Variables) espelha este conteúdo.

Copie [`.env.example`](../.env.example) para `.env` e ajuste conforme seu ambiente.

---

## Geral

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | `development` | Ambiente de execução |
| `CORS_ORIGIN` | `http://localhost:3100` | Origem permitida no gateway |

---

## Gateway (service-gateway)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `GATEWAY_PORT` | `3000` | Porta do gateway |
| `JWT_SECRET` | — | **Obrigatório em produção** (mín. 32 chars) |
| `JWT_EXPIRES_IN` | `7d` | Expiração do token |
| `AI_PROXY_TIMEOUT_MS` | `360000` | Timeout proxy para chat (ms) |
| `AUTH_SERVICE_URL` | `http://service-auth:3001` | URL interna auth |
| `AI_SERVICE_URL` | `http://service-ai:3002` | URL interna AI |
| `VOICE_SERVICE_URL` | `http://service-voice:3003` | URL interna voice |
| `SEARCH_SERVICE_URL` | `http://service-search:3004` | URL interna search |
| `NOTIFICATIONS_SERVICE_URL` | `http://service-notifications:3005` | URL interna notif |
| `MEDIA_SERVICE_URL` | `http://service-media:3006` | URL interna media |

---

## Auth (service-auth)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | `postgresql://...` | Conexão PostgreSQL |
| `ADMIN_SEED_EMAIL` | — | Email do admin inicial |
| `ADMIN_SEED_PASSWORD` | — | Senha do admin inicial |
| `ADMIN_SEED_NAME` | — | Nome do admin seed |

---

## LDAP

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `LDAP_ENABLED` | `false` | Habilitar LDAP |
| `LDAP_URL` | — | `ldap://servidor:389` |
| `LDAP_BASE_DN` | — | Base DN |
| `LDAP_BIND_DN` | — | DN do serviço |
| `LDAP_BIND_PASSWORD` | — | Senha do bind |
| `LDAP_USER_FILTER` | — | Filtro de busca de usuário |
| `LDAP_ADMIN_GROUP_DN` | — | Grupo → admin |
| `LDAP_MOCK_USER` | — | Mock local (dev sem LDAP) |

---

## IA (service-ai)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `OLLAMA_BASE_URL` | `http://ollama:11434` | URL do Ollama |
| `OLLAMA_MODEL` | `llama3.2` | Modelo de chat |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Modelo de embeddings RAG |
| `OLLAMA_TIMEOUT_MS` | `180000` | Timeout inferência (ms) |
| `OLLAMA_SYNTHESIS_TIMEOUT_MS` | `120000` | Timeout síntese (ms) |
| `OLLAMA_PEER_MODELS` | `mistral,gemma2` | Modelos peer locais |
| `OLLAMA_PEER_URLS` | — | Peers remotos: `id\|url\|model` |
| `LEARNING_DATA_PATH` | `./data/jarvis-learned-knowledge.json` | Memória aprendida |
| `LEARNING_MAX_ENTRIES` | `500` | Limite de entradas |
| `CONVERSATIONS_DATA_DIR` | `./data/conversations` | Histórico de chat por usuário (JSON) |
| `CONVERSATIONS_MAX_SESSIONS` | `50` | Máximo de conversas por usuário |
| `CONVERSATIONS_MAX_MESSAGES` | `200` | Máximo de mensagens por conversa |

---

## Voz — Piper (service-voice)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PIPER_URL` | `http://piper:5000` | URL do Piper TTS |
| `PIPER_VOICE` | `pt_BR-faber-medium.onnx` | Voz pt-BR |
| `PIPER_LENGTH_SCALE` | `1.08` | Velocidade da fala |

---

## Frontend (jarvis-web)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | URL do gateway |
| `NEXT_PUBLIC_APP_NAME` | `MyJarvis` | Nome exibido |
| `NEXT_PUBLIC_CHAT_TIMEOUT_MS` | `390000` | Timeout do chat no cliente |
| `PORT` | `3100` | Porta do frontend |

**Persistência no browser (sem env):**

| Chave `localStorage` | Descrição |
|----------------------|-----------|
| `jarvis_token` | JWT de autenticação |
| `jarvis_active_session_{userId}` | ID da conversa ativa por usuário |

---

## PostgreSQL / Redis (Docker)

| Variável | Padrão |
|----------|--------|
| `POSTGRES_USER` | `myjarvis` |
| `POSTGRES_PASSWORD` | `myjarvis_secret` |
| `POSTGRES_DB` | `myjarvis` |
| `REDIS_URL` | `redis://redis:6379` |

---

## Segurança

| Regra | Detalhe |
|-------|---------|
| **Nunca commitar** `.env` | Está no `.gitignore` |
| **Produção** | Trocar todos os valores padrão |
| **JWT_SECRET** | `openssl rand -base64 48` |
| **Sem APIs pagas** | `.env.example` não contém keys comerciais |

---

## Exemplo mínimo (.env)

```env
JWT_SECRET=sua-chave-segura-aqui-minimo-32-chars
DATABASE_URL=postgresql://myjarvis:myjarvis_secret@postgres:5432/myjarvis
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_PEER_MODELS=mistral,gemma2
LEARNING_DATA_PATH=./data/jarvis-learned-knowledge.json
CONVERSATIONS_DATA_DIR=./data/conversations
PIPER_URL=http://piper:5000
NEXT_PUBLIC_API_URL=http://localhost:3000
```
