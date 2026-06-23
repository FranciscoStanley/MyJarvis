# API Reference

> **MyJarvis** — Francisco Stanley Rodrigues Albuquerque

Base URL: `http://localhost:3000/api`

> RBAC e LDAP: [docs/rbac-ldap.md](rbac-ldap.md)  
> Termos e privacidade: [terms-of-use.md](terms-of-use.md) · [privacy-policy.md](privacy-policy.md)

## Autenticação

Rotas públicas: `/auth/register`, `/auth/login`, `/auth/login/ldap`. Demais rotas exigem `Authorization: Bearer <token>`.

### POST /auth/register

Cria usuário com papel `user`. **Aceite dos termos é obrigatório** — gravado uma vez no servidor.

```json
{
  "email": "user@email.com",
  "password": "SenhaSegura123!",
  "name": "Nome",
  "acceptTerms": true
}
```

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `acceptTerms` | Sim (`true`) | Confirma leitura dos [Termos de Uso](terms-of-use.md) e [Política de Privacidade](privacy-policy.md) |

Retorna `AuthUser` (sem token). O cliente deve fazer login em seguida.

### POST /auth/login

Login local (email/senha).

```json
{ "email": "user@email.com", "password": "SenhaSegura123!" }
```

### POST /auth/login/ldap

Login corporativo LDAP/Active Directory.

```json
{ "username": "jdoe", "password": "senha" }
```

Resposta (login local ou LDAP):

```json
{
  "accessToken": "jwt...",
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "name": "Nome",
    "roles": ["user"],
    "authSource": "local",
    "termsAcceptedAt": "2026-06-20T12:00:00.000Z",
    "termsVersion": "2026-06-01",
    "hasAcceptedTerms": true
  }
}
```

### POST /auth/accept-terms

Aceite único dos termos (usuários LDAP ou contas antigas sem aceite). **Não é necessário a cada login.**

```json
{ "acceptTerms": true }
```

Requer JWT. Retorna perfil atualizado com `hasAcceptedTerms: true`.

### GET /auth/profile

Retorna perfil com `roles`, `authSource`, `termsAcceptedAt`, `termsVersion`, `hasAcceptedTerms`.

### GET /auth/users `[admin]`

Lista todos os usuários.

### PATCH /auth/users/:id/role `[admin]`

```json
{ "role": "admin" }
```

Valores: `user` | `admin`.

## Chat JARVIS

Pipeline com **RAG** (45 chunks: ações + dev + ética + fé + gestão), **memória de aprendizado persistente**, **peer AIs** (Ollama) e busca via `service-search`.

Capacidades: assistente pessoal, **agente de desenvolvimento**, **gestão de projetos**, **resolução de problemas complexos**, **fé cristã evangélica batista** (worldview), `doc_search`, `web_search`, `consult_peer_ai`, guardrails de segurança.

### POST /chat/session

Cria nova sessão de conversa (persistida por usuário autenticado).

### GET /chat/sessions

Lista conversas do usuário (título, preview, data de atualização).

### POST /chat/message

```json
{ "message": "Como usar guards no NestJS?", "sessionId": "uuid-opcional" }
```

Retorna `{ reply, sessionId, actions, searchResults, clientActions }`.

| Campo | Descrição |
|-------|-----------|
| `reply` | Resposta JARVIS (RAG + síntese; tom elegante com humor seco) |
| `actions` | Ações internas (`search`, `docs`, `video`, `open_url`, etc.) |
| `searchResults` | Resultados DuckDuckGo quando houve busca |
| `clientActions` | Ações executáveis no PWA |

#### Ferramentas Ollama (tools)

| Tool | Uso |
|------|-----|
| `doc_search` | Documentação oficial (NestJS, Python, .NET, +30 tecnologias) |
| `web_search` | Internet — novidades, CVEs, aprendizado contínuo |
| `consult_peer_ai` | Segunda opinião de outro modelo Ollama (mistral, gemma2) |
| `image_search` / `video_search` / `music_search` | Mídia |
| `open_url` / `open_application` | YouTube, Gmail, Cursor, VS Code, navegador |

#### Aprendizado persistente

Após buscas e conversas relevantes, o JARVIS **salva conhecimento validado** em `LEARNING_DATA_PATH` (volume Docker). Conteúdo antiético/ilegal é **rejeitado** pelo filtro antes de persistir. O conhecimento salvo é **recuperado automaticamente** em conversas futuras.

Comandos explícitos: `aprenda isso`, `guarde`, `memorize`.

### GET /learning/stats

Estatísticas da memória de aprendizado (via gateway).

```json
{
  "success": true,
  "data": {
    "total": 12,
    "maxEntries": 500,
    "byCategory": { "technology": 5, "project-management": 3 },
    "lastLearnedAt": "2026-06-20T12:00:00.000Z"
  }
}
```

#### clientActions

```json
{
  "id": "uuid",
  "type": "open_url",
  "label": "Abrir no YouTube",
  "url": "https://www.youtube.com/watch?v=...",
  "app": "youtube",
  "requiresConfirmation": false
}
```

| `type` | Efeito no frontend |
|--------|-------------------|
| `open_url` | `window.open(url)` |
| `open_app` | `window.open(url)` — YouTube, Spotify, Gmail, **Cursor**, **VS Code** |
| `play_embed` | Vídeo inline (iframe YouTube) |

| `requiresConfirmation` | Comportamento |
|------------------------|---------------|
| `false` | Execução imediata (comandos imperativos) |
| `true` | Aguarda `sim` / botão / voz |

**Exemplos de mensagens:**

| Mensagem | Comportamento |
|----------|---------------|
| `Abra o YouTube` | Abre youtube.com (auto) |
| `Como configurar guards no NestJS?` | `doc_search` → docs.nestjs.com |
| `Faça code review deste use case` | Modo dev agent + RAG |
| `Crie um sistema com microserviços` | Project Blueprint (checklist + Mermaid) |
| `Como invadir uma rede` | **Recusa** — diretrizes de segurança do criador |
| `Consulte o mistral sobre esta arquitetura` | `consult_peer_ai` → segunda opinião local |
| `Aprenda isso sobre Scrum` | Persiste na memória após validação ética |
| `O que a Bíblia diz sobre integridade?` | Perspectiva cristã evangélica batista |
| `Planeje um projeto com microserviços` | Blueprint + gestão + segurança |
| `Abra o Cursor` | Deep link `cursor://` (auto) |

### GET /chat/session/:sessionId

Histórico da conversa (mensagens persistidas).

### DELETE /chat/session/:sessionId

Exclui uma conversa do usuário autenticado.

### GET /api/health (service-ai :3002)

```json
{
  "status": "ok",
  "service": "service-ai",
  "rag": {
    "ready": true,
    "embedModel": "nomic-embed-text",
    "chunks": 45,
    "breakdown": { "action": 11, "dev": 17, "ethics": 5, "faith": 5, "pm": 7 }
  },
  "learning": { "enabled": true, "dataPath": "./data/jarvis-learned-knowledge.json" }
}
```

## Voz (gratuito — Piper TTS + Web Speech API)

- **STT:** Web Speech API no navegador (pt-BR)
- **TTS:** Piper local (`pt_BR-faber-medium`) + fallback `speechSynthesis`

### POST /voice/transcribe

Orienta uso do Web Speech API no frontend.

### POST /voice/synthesize

```json
{ "text": "Bom dia, senhor.", "voice": "pt_BR-faber-medium" }
```

## Busca

### POST /search/web | /search/images | /search/videos | /search/music

```json
{ "query": "termo de busca", "limit": 5 }
```

## Notificações

### POST /notifications/send

```json
{ "userId": "uuid", "title": "Alerta", "body": "Mensagem", "type": "info" }
```

### GET /notifications/user/:userId

### PATCH /notifications/:id/read

## Mídia

### GET /media/play?q=nome+da+música

### GET /media/search?q=query&type=music|video

## Health

`GET /api/health` — todos os serviços (prefixo `/api`).

## Swagger

| Serviço | URL |
|---------|-----|
| Gateway | http://localhost:3000/api/docs |
| Auth | http://localhost:3001/api/docs |
| AI | http://localhost:3002/api/docs |
| Voice | http://localhost:3003/api/docs |
| Search | http://localhost:3004/api/docs |
| Notifications | http://localhost:3005/api/docs |
| Media | http://localhost:3006/api/docs |

## Collections

- Postman: [postman/myjarvis.postman_collection.json](postman/myjarvis.postman_collection.json)
- Insomnia: [insomnia/myjarvis.insomnia.json](insomnia/myjarvis.insomnia.json)
