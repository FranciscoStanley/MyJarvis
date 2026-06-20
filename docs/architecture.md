# Arquitetura MyJarvis

> **Autor:** Francisco Stanley Rodrigues Albuquerque

## Visão Geral

MyJarvis segue **Clean Architecture** com microserviços independentes, comunicando-se via HTTP REST através de um API Gateway. Stack 100% gratuita e open source.

## Contexto do Sistema

```mermaid
flowchart TB
    USER((Usuário))
    WEB[jarvis-web<br/>Next.js PWA :3100]

    USER -->|voz / texto| WEB
    WEB -->|HTTPS REST + JWT| GW

    subgraph Gateway["Ponto de entrada"]
        GW[service-gateway :3000]
    end

    subgraph Microservices["Microserviços NestJS"]
        AUTH[service-auth :3001]
        AI[service-ai :3002]
        VOICE[service-voice :3003]
        SEARCH[service-search :3004]
        NOTIF[service-notifications :3005]
        MEDIA[service-media :3006]
    end

    GW --> AUTH & AI & VOICE & SEARCH & NOTIF & MEDIA

    subgraph Infra["Infraestrutura"]
        PG[(PostgreSQL)]
        OLLAMA[(Ollama :11434<br/>chat + RAG 45 chunks)]
        PIPER[(Piper TTS :5000)]
        REDIS[(Redis — reservado)]
    end

    subgraph External["APIs públicas gratuitas"]
        DDG[DuckDuckGo]
        WIKI[Wikimedia Commons]
        ARCH[Internet Archive]
    end

    AUTH --> PG
    AI --> OLLAMA
    AI --> SEARCH
    VOICE --> PIPER
    SEARCH --> DDG & WIKI & ARCH
    MEDIA --> SEARCH
```

## Monorepo

```mermaid
flowchart TB
    ROOT[MyJarvis/]

    ROOT --> CURSOR[".cursor/<br/>rules + skills"]
    ROOT --> SERVICES["services/<br/>7 microserviços"]
    ROOT --> FRONTENDS["frontends/<br/>jarvis-web"]
    ROOT --> PACKAGES["packages/<br/>shared · nest-auth · nest-security · nest-vitest"]
    ROOT --> DOCS["docs/"]
    ROOT --> DOCKER["docker-compose.yml"]

    SERVICES --> GW_S[service-gateway]
    SERVICES --> AUTH_S[service-auth]
    SERVICES --> AI_S[service-ai]
    SERVICES --> VOICE_S[service-voice]
    SERVICES --> SEARCH_S[service-search]
    SERVICES --> NOTIF_S[service-notifications]
    SERVICES --> MEDIA_S[service-media]
```

## Clean Architecture (por microserviço)

```mermaid
flowchart TB
    subgraph Presentation["presentation/"]
        CTRL[Controllers]
        GUARDS[Guards / Filters]
        MOD[AppModule]
    end

    subgraph Application["application/"]
        UC[Use Cases]
        APP_DTO[DTOs de aplicação]
    end

    subgraph Domain["domain/"]
        ENT[Entities]
        PORTS[Ports — interfaces]
        CONST[Constants]
    end

    subgraph Infrastructure["infrastructure/"]
        ADAPT[Adapters — Ollama, DuckDuckGo]
        REPO[Repositories — TypeORM]
    end

    CTRL --> UC
    MOD --> UC
    UC --> PORTS
    UC --> ENT
    ADAPT -.->|implements| PORTS
    REPO -.->|implements| PORTS

    style Domain fill:#1e3a5f,stroke:#22d3ee,color:#fff
    style Application fill:#1e293b,stroke:#94a3b8,color:#fff
    style Infrastructure fill:#334155,stroke:#fbbf24,color:#fff
    style Presentation fill:#0f172a,stroke:#22d3ee,color:#fff
```

### Regras de dependência

```mermaid
flowchart LR
    D[domain] --> A[application]
    D --> I[infrastructure]
    D --> P[presentation]
    A --> P
    I --> A

    D -.-x|proibido| I
    D -.-x|proibido| P
```

## Fluxo de Conversa JARVIS (RAG + Ações)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant W as jarvis-web
    participant B as Web Speech API
    participant G as service-gateway
    participant AI as service-ai
    participant RAG as RAG (OllamaRagAdapter)
    participant O as Ollama
    participant S as service-search
    participant V as service-voice
    participant P as Piper
    participant DDG as DuckDuckGo

    U->>W: Fala ou digita
    opt Entrada por voz
        W->>B: STT gratuito
        B-->>W: Texto transcrito
    end
    W->>G: POST /api/chat/message
    G->>AI: Forward
    AI->>RAG: retrieve + memória aprendida
    RAG-->>AI: Contexto (ações, dev, ética, fé, PM, aprendido…)
    AI->>O: POST /api/chat + tools (doc_search, web_search, consult_peer_ai…)
    O-->>AI: Resposta + tool calls
    opt Busca necessária
        AI->>S: POST /api/search/*
        S->>DDG: Query
        DDG-->>S: Resultados
        S-->>AI: JSON
        AI->>O: Sintetizar resposta com contexto
        O-->>AI: Resposta conversacional
    end
    AI-->>G: reply + clientActions
    G-->>W: JSON
    alt requiresConfirmation = false
        W->>W: window.open / embed YouTube (imediato)
    else requiresConfirmation = true
        W->>U: Botões ou pergunta de confirmação
        U->>W: sim / botão
        W->>W: window.open / embed
    end
    opt Resposta falada
        W->>G: POST /api/voice/synthesize
        G->>V: Forward
        V->>P: HTTP TTS (pt_BR-faber-medium)
        P-->>V: WAV
        V-->>W: audioBase64
        W->>W: Reproduz áudio (fallback speechSynthesis pt-BR)
    end
    W-->>U: Texto + ações + embed
```

## Aprendizado Contínuo e Peer AIs

```mermaid
sequenceDiagram
    participant U as Usuário
    participant AI as service-ai
    participant O as Ollama
    participant P as Peer (mistral/gemma2)
    participant S as service-search
    participant V as learning-validator
    participant M as Memória JSON

    U->>AI: Mensagem / "aprenda isso"
    AI->>O: chat + RAG + memória aprendida
    opt Segunda opinião
        AI->>P: consult_peer_ai
        P-->>AI: Resposta peer
    end
    opt Busca
        AI->>S: web_search / doc_search
        S-->>AI: Resultados
    end
    AI->>V: Candidato a aprendizado
    alt Conteúdo ético
        V->>M: Persistir entrada
    else Bloqueado
        V-->>AI: Rejeitar (log)
    end
    AI-->>U: Resposta + conhecimento aplicado
```

## Autenticação e Termos de Uso

```mermaid
sequenceDiagram
    participant W as jarvis-web
    participant G as service-gateway
    participant A as service-auth
    participant DB as PostgreSQL

    alt Cadastro
        W->>G: POST /api/auth/register { acceptTerms: true }
        G->>A: Forward
        A->>DB: User + termsAcceptedAt + termsVersion
        W->>G: POST /api/auth/login
        G->>A: Forward
        A-->>W: JWT + hasAcceptedTerms: true
    else LDAP sem aceite
        W->>G: POST /api/auth/login/ldap
        A-->>W: JWT + hasAcceptedTerms: false
        W->>W: TermsAcceptModal
        W->>G: POST /api/auth/accept-terms
        A->>DB: Atualiza termsAcceptedAt
    else Login subsequente
        W->>G: GET /api/auth/profile
        A-->>W: hasAcceptedTerms: true (sem novo modal)
    end
```

## Deploy Docker

```mermaid
flowchart LR
    subgraph DockerCompose["docker compose"]
        direction TB
        WEB_C[jarvis-web :3100]
        GW_C[service-gateway :3000]
        MS_C[7 microserviços NestJS]
        PG_C[(postgres)]
        OL_C[(ollama)]
        OL_I[ollama-init]
        PP_C[piper :5000]
    end

    WEB_C --> GW_C --> MS_C
    MS_C --> PG_C
    MS_C --> OL_C
    OL_I --> OL_C
    MS_C --> PP_C
```

## Decisões de Design

- **Gateway único**: frontend nunca acessa serviços internos diretamente
- **Ports & Adapters**: Ollama, DuckDuckGo, Piper etc. são substituíveis sem alterar use cases
- **RAG local**: 45 chunks (ações + dev + ética + fé + PM) + **memória aprendida persistente** filtrada por ética
- **Peer AIs**: `consult_peer_ai` via Ollama (`OLLAMA_PEER_MODELS`) — stack gratuita
- **Fé cristã evangélica batista**: worldview do JARVIS — `.cursor/skills/christian-faith/`
- **Gestão de projetos**: Scrum, problemas complexos, entrega segura — chunks `pm-knowledge.ts`
- **Termos de Uso**: aceite único no cadastro (`termsAcceptedAt`) — [terms-of-use.md](terms-of-use.md)
- **Aprendizado contínuo**: `web_search` + `doc_search` — JARVIS não limitado ao RAG estático
- **Sessões in-memory**: conversas em memória (Redis reservado para produção futura)
- **PWA**: mobile via Progressive Web App, sem app nativo separado
- **Stack gratuito**: sem APIs pagas — ver [free-stack.md](free-stack.md)

## Escalabilidade Futura

```mermaid
flowchart TB
    subgraph Atual["Estado atual"]
        GW1[Gateway]
        MS1[Microserviços]
        PG1[(PostgreSQL)]
        OL1[(Ollama local)]
    end

    subgraph Futuro["Evolução planejada"]
        GW2[Gateway + rate limit]
        MS2[Microserviços replicados]
        REDIS2[(Redis — sessões)]
        MQ[RabbitMQ — async]
        K8S[Kubernetes]
    end

    Atual -->|escala horizontal| Futuro
```
