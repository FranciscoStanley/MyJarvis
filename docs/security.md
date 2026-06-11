# Segurança — MyJarvis

> **Autor:** Francisco Stanley Rodrigues Albuquerque

Este documento descreve as camadas de segurança implementadas e as práticas recomendadas para produção.

## Visão geral

```
Browser → Gateway (JWT, rate limit, Helmet, CORS)
              ↓
         Microserviços (rede interna)
              ↓
         Auth (LDAP, lockout, bcrypt cost 12)
```

O frontend **nunca** fala diretamente com `service-auth` ou outros serviços — apenas com o gateway.

## Autenticação e JWT

| Controle | Detalhe |
|----------|---------|
| Algoritmo | HS256 explícito (previne algorithm confusion) |
| Issuer | `myjarvis-auth` |
| Audience | `myjarvis-api` |
| Secret | Mínimo 32 caracteres; validado em boot (bloqueia produção se fraco) |
| Expiração | Configurável via `JWT_EXPIRES_IN` (padrão 7d) |

Tokens inválidos, expirados ou com issuer/audience incorretos são rejeitados no gateway e no auth.

## RBAC

- Papéis: `user`, `admin`
- Endpoints administrativos exigem `@Roles(UserRole.ADMIN)`
- Gateway repassa identidade via headers internos (`X-User-Id`, `X-User-Email`, `X-User-Roles`) — **não confie nesses headers vindo de fora da rede interna**

## Proteção contra brute-force

1. **Rate limiting** (`@nestjs/throttler`) — global + limites reforçados em login/register/LDAP
2. **Lockout** — após 5 falhas por email/usuário + IP, bloqueio de 15 minutos
3. **Mensagens genéricas** — “Credenciais inválidas” (sem revelar se email existe)

## Senhas

Política no registro (OWASP-inspired):

- 8–128 caracteres
- Maiúscula, minúscula, número e símbolo (`@$!%*?&#_-+.`)
- Hash bcrypt com cost **12**

## Gateway e proxy

- **Helmet** — headers HTTP seguros (HSTS em produção)
- **ValidationPipe estrito** — `forbidNonWhitelisted`, rejeita campos extras
- **Limite de body** — 1 MB (gateway), 256 KB (auth)
- **Path sanitization** — bloqueia `..`, null bytes, path > 2048 chars
- **Headers** — não repassa hop-by-hop nem permite spoofing de identidade
- **Axios** — `maxRedirects: 0` (anti-SSRF via redirect)
- **CORS** — apenas origens em `CORS_ORIGIN` (ex: frontend)

## Swagger / documentação API

Desabilitado em `NODE_ENV=production`. Para expor em staging:

```env
ENABLE_SWAGGER=true
```

## Frontend (Next.js)

Headers de segurança: `X-Frame-Options`, `X-Content-Type-Options`, CSP, `Referrer-Policy`, `Permissions-Policy`.

## Variáveis de ambiente críticas

```env
# Gerar: openssl rand -base64 48
JWT_SECRET=<string-aleatória-≥32-chars>

CORS_ORIGIN=http://localhost:3100,https://app.seudominio.com

# Auth não expõe CORS ao browser — tráfego via gateway
```

## Checklist de produção

- [ ] `JWT_SECRET` forte e único por ambiente
- [ ] `NODE_ENV=production`
- [ ] PostgreSQL com credenciais fortes; `synchronize: false`
- [ ] Serviços internos **sem** porta pública (apenas gateway)
- [ ] TLS terminado no reverse proxy (nginx, Traefik, Cloudflare)
- [ ] LDAP com bind dedicado de leitura (não admin domain)
- [ ] Rotacionar `JWT_SECRET` implica logout de todos (planejar janela)
- [ ] Monitorar 429 (rate limit) e 401 em `/auth/login`
- [ ] Backup do banco e auditoria de alterações de role

## Pacotes

- `@myjarvis/nest-security` — Helmet, ValidationPipe, sanitização de proxy
- `@myjarvis/nest-auth` — JWT guard, RBAC, rate limit de auth

## Referências

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
