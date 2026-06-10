# API Reference

Base URL: `http://localhost:3000/api`

## Autenticação

### POST /auth/register
```json
{ "email": "user@email.com", "password": "senha123", "name": "Nome" }
```

### POST /auth/login
```json
{ "email": "user@email.com", "password": "senha123" }
```
Retorna `{ accessToken, user }`.

### GET /auth/profile
Header: `Authorization: Bearer <token>`

## Chat JARVIS

### POST /chat/session
Cria nova sessão de conversa.

### POST /chat/message
```json
{ "message": "JARVIS, busque notícias sobre IA", "sessionId": "uuid-opcional" }
```
Retorna `{ reply, sessionId, actions, searchResults }`.

### GET /chat/session/:sessionId
Histórico da conversa.

## Voz

### POST /voice/transcribe
```json
{ "audioBase64": "...", "language": "pt" }
```

### POST /voice/synthesize
```json
{ "text": "Bom dia, senhor.", "voice": "onyx" }
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

### GET /health
Todos os serviços expõem health check.

## Swagger

Documentação interativa disponível em cada serviço:
- Gateway: http://localhost:3000/api/docs
- Auth: http://localhost:3001/api/docs
- AI: http://localhost:3002/api/docs
