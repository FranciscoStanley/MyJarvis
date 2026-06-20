# service-auth

Autenticação, autorização (RBAC), LDAP e **aceite de Termos de Uso** do MyJarvis.

**Autor:** Francisco Stanley Rodrigues Albuquerque

- **Porta**: 3001
- **Swagger**: http://localhost:3001/api/docs

## Responsabilidades

| Área | Detalhe |
|------|---------|
| Login local | Email/senha + JWT |
| Login LDAP | Active Directory / LDAP corporativo |
| RBAC | Papéis `user` e `admin` |
| Termos | Aceite obrigatório no cadastro; endpoint para aceite tardio |
| Persistência | PostgreSQL via TypeORM |

## Termos de Uso

Versão vigente: `TERMS_VERSION` em `@myjarvis/shared` (atual: `2026-06-01`).

| Campo (User) | Descrição |
|--------------|-----------|
| `termsAcceptedAt` | Data/hora do aceite |
| `termsVersion` | Versão aceita |
| `hasAcceptedTerms` | Calculado no perfil — `true` se versão atual |

### Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/register` | Público | `acceptTerms: true` obrigatório |
| `POST` | `/auth/accept-terms` | JWT | Aceite único (LDAP ou contas antigas) |
| `GET` | `/auth/profile` | JWT | Inclui `hasAcceptedTerms` |

O aceite é **persistido no PostgreSQL** — não repete a cada login enquanto a versão dos termos não mudar.

Documentação: [docs/terms-of-use.md](../../docs/terms-of-use.md) · [docs/api.md](../../docs/api.md)

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL |
| `JWT_SECRET` | Secret JWT (produção) |
| `LDAP_*` | Configuração LDAP (opcional) |

Ver [.env.example](../../.env.example) e [docs/rbac-ldap.md](../../docs/rbac-ldap.md).

## Desenvolvimento

```bash
npm run start:dev -w service-auth
npm run test:unit -w service-auth
npm run test:integration -w service-auth
```

## Testes

`test/auth.use-cases.spec.ts` — registro com/sem `acceptTerms`, `AcceptTermsUseCase`.

Skill: `.cursor/skills/nestjs-services/SKILL.md`
