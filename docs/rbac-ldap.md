# RBAC e LDAP

MyJarvis implementa **RBAC** com dois papéis e autenticação **LDAP** opcional.

## Papéis (RBAC)

| Papel | Valor | Permissões |
|-------|-------|------------|
| Usuário | `user` | Chat, voz, busca, mídia |
| Administrador | `admin` | Tudo do usuário + listar usuários + alterar papéis |

Administradores herdam permissões de usuário (`hasRole` trata admin como superuser).

## Autenticação

### Local (email/senha)

- `POST /api/auth/register` — cria usuário com papel `user`; **`acceptTerms: true` obrigatório**
- `POST /api/auth/login` — JWT com `roles` e `hasAcceptedTerms` no objeto `user`

### LDAP

- `POST /api/auth/login/ldap` — body: `{ username, password }`
- Provisionamento JIT no PostgreSQL (`authSource: ldap`)
- Grupo LDAP configurado em `LDAP_ADMIN_GROUP_DN` → papel `admin`
- Usuários LDAP podem precisar de `POST /api/auth/accept-terms` na primeira sessão (aceite único)

### Termos de Uso

- Versão vigente: `TERMS_VERSION` em `@myjarvis/shared` (atual: `2026-06-01`)
- Cadastro local grava `termsAcceptedAt` automaticamente
- `GET /api/auth/profile` retorna `hasAcceptedTerms`
- Documentação: [terms-of-use.md](terms-of-use.md) · [privacy-policy.md](privacy-policy.md)

### Endpoints protegidos (admin)

- `GET /api/auth/users`
- `PATCH /api/auth/users/:id/role`

## JWT

Payload (`@myjarvis/shared`):

```json
{
  "sub": "uuid",
  "email": "user@example.com",
  "roles": ["user"],
  "authSource": "local"
}
```

## Gateway

- Rotas `/api/auth/login`, `/register`, `/login/ldap` — públicas
- `/api/chat/*`, `/api/voice/*`, `/api/search/*`, `/api/media/*` — **JWT obrigatório**
- Headers repassados: `X-User-Id`, `X-User-Email`, `X-User-Roles`

## Configuração

Ver `.env.example`:

```env
LDAP_ENABLED=true
LDAP_URL=ldap://seu-servidor:389
LDAP_BASE_DN=dc=empresa,dc=com
LDAP_ADMIN_GROUP_DN=cn=admins,ou=groups,dc=empresa,dc=com
ADMIN_SEED_EMAIL=franciscothestanley@gmail.com
ADMIN_SEED_PASSWORD="Root@password#2100"
```

### Dev sem LDAP

```env
LDAP_ENABLED=false
LDAP_MOCK_USER=ldapuser
LDAP_MOCK_PASSWORD=ldappass
LDAP_MOCK_ADMIN=true   # simula admin LDAP
```

## Pacotes

- `@myjarvis/shared` — `UserRole`, `JwtPayload`, guards helpers
- `@myjarvis/nest-auth` — `JwtAuthGuard`, `RolesGuard`, `@Public()`, `@Roles()`

## Frontend

- Abas **Email**, **LDAP** e **Registrar** no modal de login
- Checkbox de aceite dos termos no cadastro (`AuthModal`)
- `TermsAcceptModal` para LDAP/usuários sem `hasAcceptedTerms`
- Páginas `/terms` e `/privacy`
- Badge **admin** no header para administradores
- Chat exige autenticação **e** aceite de termos vigente (sem modo convidado)
