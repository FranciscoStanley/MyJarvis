# Política de Privacidade — MyJarvis

**Versão:** 2026-06-01  
**Controlador:** Francisco Stanley Rodrigues Albuquerque  
**Base legal:** Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)

## 1. Dados que coletamos

| Dado | Finalidade | Armazenamento |
|------|------------|---------------|
| Nome, e-mail | Autenticação e identificação | PostgreSQL (`service-auth`) |
| Hash de senha (bcrypt) | Login local | PostgreSQL — **nunca** em texto claro |
| Papel (user/admin) | Controle de acesso (RBAC) | PostgreSQL |
| `termsAcceptedAt`, `termsVersion` | Registro de aceite dos termos | PostgreSQL |
| Token JWT | Sessão autenticada | `localStorage` no navegador (`jarvis_token`) |
| ID da conversa ativa | Restaurar chat após reload | `localStorage` (`jarvis_active_session_{userId}`) |
| Mensagens de chat | Funcionamento e histórico do assistente | JSON por usuário em `service-ai` (`CONVERSATIONS_DATA_DIR`, volume Docker) |
| IP (login) | Proteção contra brute-force | Memória temporária |

## 2. O que não coletamos como produto

- Não vendemos dados pessoais
- Não exigimos APIs pagas de terceiros para IA (Ollama local)
- Buscas web usam DuckDuckGo — consulte a política deles para dados enviados na busca

## 3. Compartilhamento

Dados **não são compartilhados** com terceiros comerciais. Serviços internos do monorepo (gateway, auth, ai, search, voice) processam dados apenas para operar a plataforma.

## 4. Direitos do titular (LGPD)

Você pode solicitar ao desenvolvedor:

- Confirmação de tratamento
- Acesso aos dados
- Correção de dados incompletos
- Eliminação de dados (quando aplicável)
- Informação sobre compartilhamento

## 5. Segurança

- Senhas com hash bcrypt (12 rounds)
- JWT com issuer/audience validados
- Rate limiting e proteção de login
- Secrets em variáveis de ambiente (`.env`)

## 6. Retenção

- Conta de usuário: enquanto ativa
- Conversas de chat: em arquivos JSON por usuário no volume Docker (`/app/data/conversations/`) — excluíveis via `DELETE /api/chat/session/:id` ou remoção da conta
- Aceite de termos: mantido com data e versão para auditoria

## 7. Menores

O serviço não é direcionado a menores de 18 anos sem supervisão de responsável legal.

## 8. Alterações

Mudanças nesta política serão refletidas na `TERMS_VERSION` e podem exigir novo aceite.

## 9. Contato

**Francisco Stanley Rodrigues Albuquerque** — desenvolvedor do MyJarvis
