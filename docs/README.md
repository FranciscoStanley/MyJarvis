# Documentação MyJarvis

> **Fonte canônica** deste repositório. A [wiki GitHub](https://github.com/FranciscoStanley/MyJarvis/wiki) espelha estes arquivos.

**Autor:** Francisco Stanley Rodrigues Albuquerque

---

## Início

| Documento | Descrição |
|-----------|-----------|
| [getting-started.md](getting-started.md) | Setup em 4 passos, primeiro login, conversas persistentes |
| [deployment.md](deployment.md) | Docker, produção, volumes e backup |
| [environment-variables.md](environment-variables.md) | Todas as variáveis de ambiente |
| [contributing.md](contributing.md) | Fluxo de PR, CI, padrões |

## Arquitetura e API

| Documento | Descrição |
|-----------|-----------|
| [architecture.md](architecture.md) | Diagramas Mermaid, RAG, **persistência de conversas** |
| [project-structure.md](project-structure.md) | Mapa de pastas do monorepo |
| [api.md](api.md) | Referência HTTP (gateway) |
| [free-stack.md](free-stack.md) | Stack 100% gratuita |

## Segurança e legal

| Documento | Descrição |
|-----------|-----------|
| [security.md](security.md) | Hardening e OWASP |
| [rbac-ldap.md](rbac-ldap.md) | Papéis e LDAP |
| [terms-of-use.md](terms-of-use.md) | Termos de Uso |
| [privacy-policy.md](privacy-policy.md) | LGPD e dados coletados |

## Testes e ferramentas

| Documento | Descrição |
|-----------|-----------|
| [testing.md](testing.md) | CI em 3 etapas, Vitest, Playwright |
| [postman/](postman/myjarvis.postman_collection.json) | Collection Postman |
| [insomnia/](insomnia/myjarvis.insomnia.json) | Collection Insomnia |
| [wiki-sync.md](wiki-sync.md) | Sincronizar `docs/` → wiki GitHub |

---

## Sincronizar wiki

```bash
npm run wiki:sync
```

Gera a pasta `wiki/` localmente. Publique com push em `MyJarvis.wiki.git` — instruções em [wiki-sync.md](wiki-sync.md).

---

## Destaques recentes — Conversas persistentes

- Backend: `FileConversationStoreAdapter` em `service-ai` (`CONVERSATIONS_DATA_DIR`)
- API: `GET /chat/sessions`, `GET /chat/session/:id`, `DELETE /chat/session/:id`
- Frontend: sidebar de conversas + restauração após reload (`jarvis_active_session_{userId}`)

Ver [architecture.md](architecture.md#persistência-de-conversas) e [api.md](api.md#chat-jarvis).
