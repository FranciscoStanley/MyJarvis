# API Reference

> **MyJarvis** — Francisco Stanley Rodrigues Albuquerque

Base URL: `http://localhost:3000/api`

> RBAC e LDAP: [docs/rbac-ldap.md](rbac-ldap.md)

## Autenticação

Rotas públicas: `/auth/register`, `/auth/login`, `/auth/login/ldap`. Demais rotas exigem `Authorization: Bearer <token>`.

### POST /auth/register
Cria usuário com papel `user`.
```json
{ "email": "user@email.com", "password": "senha123", "name": "Nome" }
```

### POST /auth/login
Login local (email/senha).
```json
{ "email": "user@email.com", "password": "senha123" }
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
    "authSource": "local"
  }
}
```

### GET /auth/profile
Retorna perfil com `roles` e `authSource`.

### GET /auth/users `[admin]`
Lista todos os usuários.

### PATCH /auth/users/:id/role `[admin]`
```json
{ "role": "admin" }
```
Valores: `user` | `admin`.

## Chat JARVIS

Pipeline com **RAG** (Ollama + `nomic-embed-text`): antes de cada resposta, o `service-ai` recupera chunks de conhecimento sobre ações (YouTube, Google, navegador, Spotify) e injeta no system prompt.

### POST /chat/session
Cria nova sessão de conversa.

### POST /chat/message
```json
{ "message": "Abra o YouTube na música Espírito Santo", "sessionId": "uuid-opcional" }
```

Retorna `{ reply, sessionId, actions, searchResults, clientActions }`.

| Campo | Descrição |
|-------|-----------|
| `reply` | Resposta conversacional JARVIS (RAG + síntese com resultados de busca) |
| `actions` | Ações internas detectadas (`search`, `video`, `open_url`, etc.) |
| `searchResults` | Resultados DuckDuckGo/YouTube quando houve busca |
| `clientActions` | Ações executáveis no PWA — ver tabela abaixo |

#### clientActions

```json
{
  "id": "uuid",
  "type": "open_url",
  "label": "Abrir no YouTube",
  "description": "Abrir «Espírito Santo» no YouTube",
  "url": "https://www.youtube.com/watch?v=...",
  "app": "youtube",
  "requiresConfirmation": false
}
```

| `type` | Efeito no frontend |
|--------|-------------------|
| `open_url` | `window.open(url)` — Google, resultados web, vídeo YouTube |
| `open_app` | `window.open(url)` — YouTube, Spotify, Gmail |
| `play_embed` | Reproduz vídeo inline na UI (iframe YouTube) |

| `requiresConfirmation` | Comportamento |
|------------------------|---------------|
| `false` | Execução imediata (comandos imperativos: *abra*, *toque*, *entre*) |
| `true` | Aguarda confirmação (`sim`, botão ou voz) |

**Exemplos de mensagens:**

| Mensagem | Ação esperada |
|----------|---------------|
| `Abra o YouTube` | Abre youtube.com (auto) |
| `Toque Espírito Santo no YouTube` | Busca vídeo → abre URL (auto) |
| `Busque no Google inteligência artificial` | Busca web + opção abrir Google |
| `Abrir uma nova aba do navegador` | `about:blank` (auto) |

Fluxo de confirmação: após busca não imperativa, JARVIS pergunta se deseja abrir/reproduzir → usuário responde `sim`, `não`, ou escolhe opção (`abre no spotify`) → `clientActions` retornam com `requiresConfirmation: false`.

### GET /chat/session/:sessionId
Histórico da conversa.

### GET /health (service-ai :3002)

Health do serviço de IA inclui status RAG:

```json
{
  "status": "ok",
  "service": "service-ai",
  "rag": { "ready": true, "embedModel": "nomic-embed-text", "chunks": 7 }
}
```

## Voz (gratuito — Piper TTS + Web Speech API)

- **STT (entrada):** Web Speech API no navegador (pt-BR)
- **TTS (saída):** [Piper](https://github.com/OHF-Voice/piper1-gpl) local via `service-voice` — voz `pt_BR-faber-medium` (português brasileiro). Se Piper estiver offline, o frontend usa fallback `speechSynthesis` pt-BR.

Não replica a voz original do filme (direitos autorais da Marvel/Disney).

### POST /voice/transcribe
Preferir microfone no app. Endpoint orienta uso do Web Speech API.

### POST /voice/synthesize
```json
{ "text": "Bom dia, senhor.", "voice": "pt_BR-faber-medium" }
```
Retorna `{ audioBase64, format: "wav", clientSide: false, voice }` quando Piper está disponível.
Fallback: `{ clientSide: true, format: "browser-tts", text }`.

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

### GET /health
Todos os serviços expõem health check.

## Swagger

Documentação interativa disponível em cada serviço:
- Gateway: http://localhost:3000/api/docs
- Auth: http://localhost:3001/api/docs
- AI: http://localhost:3002/api/docs
