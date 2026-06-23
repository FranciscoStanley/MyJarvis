# jarvis-web

Frontend Next.js — interface web e mobile (PWA) do MyJarvis.

**Autor:** Francisco Stanley Rodrigues Albuquerque

- **Porta**: 3100
- **PWA**: Instalável em dispositivos móveis

## Features

- Orb animado JARVIS
- Chat por texto e voz (Web Speech API STT, pt-BR)
- **Histórico persistente** — conversas sobrevivem ao reload da página
- **Sidebar de conversas** — listar, criar, alternar e excluir chats
- TTS via Piper (`pt_BR-faber-medium`) com fallback `speechSynthesis`
- Execução automática de `clientActions` (YouTube, Google, Cursor, VS Code)
- **Termos de Uso**: checkbox no cadastro; modal de aceite único para LDAP/usuários legados
- Páginas legais: `/terms` e `/privacy`
- Gate de acesso: usuário autenticado sem `hasAcceptedTerms` vê `TermsAcceptModal` antes do chat
- Tema escuro elegante
- Responsivo mobile-first

## Persistência de conversas

```mermaid
sequenceDiagram
    participant U as Usuário
    participant S as jarvis.store
    participant LS as localStorage
    participant API as Gateway /api/chat

    U->>S: Login ou reload
    S->>API: GET /chat/sessions
    S->>LS: jarvis_active_session_{userId}
    S->>API: GET /chat/session/:id
    API-->>S: messages[]
    S-->>U: Chat restaurado

    U->>S: Nova mensagem
    S->>API: POST /chat/message
    S->>API: GET /chat/sessions (atualiza títulos)
```

| Componente | Função |
|------------|--------|
| `ConversationSidebar.tsx` | Lista de conversas (desktop + drawer mobile) |
| `jarvis.store.ts` | `loadConversations`, `selectConversation`, `createNewChat`, `deleteConversation` |
| `lib/api.ts` | `listSessions`, `getSessionHistory`, `deleteSession` |
| `localStorage` | Lembra a conversa ativa por usuário |

## Fluxo de autenticação e termos

```mermaid
sequenceDiagram
    participant U as Usuário
    participant W as jarvis-web
    participant G as Gateway

    alt Cadastro
        U->>W: AuthModal + acceptTerms
        W->>G: POST /auth/register
        W->>G: POST /auth/login
        G-->>W: hasAcceptedTerms: true
    else LDAP sem aceite
        W->>G: POST /auth/login/ldap
        G-->>W: hasAcceptedTerms: false
        W->>W: TermsAcceptModal
        W->>G: POST /auth/accept-terms
    end
    W->>G: GET /chat/sessions
    W-->>U: Chat JARVIS liberado com histórico
```

Documentação legal: [docs/terms-of-use.md](../../docs/terms-of-use.md) · [docs/privacy-policy.md](../../docs/privacy-policy.md)

## Desenvolvimento

```bash
npm run dev -w jarvis-web
npm run test -w jarvis-web
npm run test:e2e -w jarvis-web
```

Configure `NEXT_PUBLIC_API_URL=http://localhost:3000` no `.env`.

## Estrutura relevante

| Caminho | Função |
|---------|--------|
| `src/components/jarvis/AuthModal.tsx` | Login, registro com `acceptTerms` |
| `src/components/jarvis/TermsAcceptModal.tsx` | Aceite pós-login (LDAP) |
| `src/components/jarvis/ConversationSidebar.tsx` | Sidebar de conversas |
| `src/app/terms/page.tsx` | Termos de Uso |
| `src/app/privacy/page.tsx` | Política de Privacidade |
| `src/stores/jarvis.store.ts` | Estado global, persistência de chat |
| `src/lib/api.ts` | Cliente HTTP — apenas gateway |

Skill: `.cursor/skills/nextjs-frontend/SKILL.md`
