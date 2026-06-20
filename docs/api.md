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

### POST /chat/session
Cria nova sessão de conversa.

### POST /chat/message
```json
{ "message": "JARVIS, busque notícias sobre IA", "sessionId": "uuid-opcional" }
```
Retorna `{ reply, sessionId, actions, searchResults, clientActions }`.

- `reply` — resposta conversacional sintetizada (estilo JARVIS)
- `searchResults` — resultados de busca quando aplicável
- `clientActions` — ações executáveis no cliente (abrir URL, YouTube, Spotify, reproduzir embed). Com `requiresConfirmation: true` até o usuário confirmar ("sim", botão na UI ou voz)

Fluxo de confirmação: após busca, JARVIS pergunta se deseja abrir/reproduzir → usuário responde `sim`, `não`, ou escolhe opção específica (`abre no spotify`) → `clientActions` retornam com `requiresConfirmation: false` para execução imediata no navegador/PWA.

### GET /chat/session/:sessionId
Histórico da conversa.

## Voz (gratuito — Web Speech API)

A transcrição e síntese acontecem **no navegador** (Chrome/Edge). O backend retorna metadados `clientSide: true`.

TTS no frontend usa voz **en-GB** quando disponível (estilo JARVIS), com tom grave e pausado. Não replica a voz original do filme (direitos autorais); aproxima via `speechSynthesis` nativo.

### POST /voice/transcribe
Preferir microfone no app. Endpoint orienta uso do Web Speech API.

### POST /voice/synthesize
Retorna `{ clientSide: true, text }` para TTS no navegador.

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
