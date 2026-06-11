# service-gateway

API Gateway — ponto de entrada unificado para todos os microserviços.

**Autor:** Francisco Stanley Rodrigues Albuquerque

- **Porta**: 3000
- **Swagger**: http://localhost:3000/api/docs

## Endpoints

Proxy para `/auth/*`, `/chat/*`, `/voice/*`, `/search/*`, `/notifications/*`, `/media/*`

## Desenvolvimento

```bash
npm run start:dev -w service-gateway
npm run test -w service-gateway
```
