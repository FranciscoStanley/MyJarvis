# Início Rápido

Coloque o MyJarvis no ar em poucos minutos com Docker.

> **Fonte canônica:** este arquivo em `docs/getting-started.md`. A [wiki GitHub](https://github.com/FranciscoStanley/MyJarvis/wiki/Getting-Started) espelha este conteúdo.

---

## Pré-requisitos

| Requisito | Versão mínima | Notas |
|-----------|---------------|-------|
| **Node.js** | 20+ | Para desenvolvimento local e testes |
| **Docker** | 24+ | Engine + Compose V2 |
| **RAM livre** | ~4 GB | Ollama + Llama 3.2 |
| **Disco** | ~5 GB | Modelos llama3.2 + nomic-embed-text |

---

## Setup em 4 passos

### 1. Clonar e configurar

```bash
git clone https://github.com/FranciscoStanley/MyJarvis.git
cd MyJarvis
cp .env.example .env
```

Edite `.env` se necessário. Valores padrão funcionam para desenvolvimento local. Ver [Variáveis de Ambiente](environment-variables.md).

### 2. Subir a stack

```bash
docker compose up -d --build
```

Isso inicia: PostgreSQL, Redis, Ollama, **ollama-init** (pull automático), **Piper TTS**, gateway, 6 microserviços e o frontend.

### 3. Aguardar modelos (primeira vez)

O serviço `ollama-init` baixa automaticamente `llama3.2` e `nomic-embed-text` (~2–3 GB). Acompanhe:

```bash
docker compose logs -f ollama-init
```

Opcional — peer AIs:

```bash
docker compose exec ollama ollama pull mistral
docker compose exec ollama ollama pull gemma2
```

### 4. Acessar o JARVIS

Abra **http://localhost:3100** no Chrome ou Edge (recomendado para voz).

| URL | Descrição |
|-----|-----------|
| http://localhost:3100 | Interface JARVIS |
| http://localhost:3000/api/docs | Swagger do Gateway |
| http://localhost:11434 | API Ollama |
| http://localhost:3002/api/health | Status RAG (45 chunks) + aprendizado |

---

## Primeiro login

1. Clique em **Entrar** na interface
2. Registre-se com email, senha e **aceite dos termos** (`acceptTerms: true`)
3. Ou use LDAP se configurado — ver [RBAC & LDAP](rbac-ldap.md)

O primeiro usuário recebe papel `user`. Administradores via seed (`ADMIN_SEED_*`) ou LDAP.

---

## Desenvolvimento local (sem Docker completo)

```bash
npm install
npm run build:packages
npm run dev -w jarvis-web   # frontend :3100
```

Para backend completo, prefira `docker compose up -d`.

---

## Verificar saúde

```bash
curl http://localhost:3000/api/health
curl http://localhost:3002/api/health
```

O `service-ai` retorna status RAG (`chunks: 45`) e aprendizado (`learning.enabled`).

### Conversas persistentes

Após login, o histórico de chat **sobrevive ao recarregar a página**:

1. Sidebar **Conversas** no painel de chat (desktop) ou ícone no header (mobile)
2. Botão **+** cria nova conversa
3. Cada conversa recebe título automático a partir da primeira mensagem
4. A última conversa ativa é lembrada por usuário no navegador

---

## Próximos passos

- [Deployment](deployment.md) — Docker, variáveis e produção
- [API Reference](api.md) — endpoints disponíveis
- [Testes & CI/CD](testing.md) — validar antes de contribuir
- [Contribuindo](contributing.md) — fluxo de PR e padrões
