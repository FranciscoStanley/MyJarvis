# Arquitetura MyJarvis

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
        REDIS[(Redis)]
        OLLAMA[(Ollama :11434)]
    end

    subgraph External["APIs públicas gratuitas"]
        DDG[DuckDuckGo]
        WIKI[Wikimedia Commons]
        ARCH[Internet Archive]
    end

    AUTH --> PG
    AI --> OLLAMA
    AI --> SEARCH
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
    ROOT --> PACKAGES["packages/<br/>shared"]
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

## Fluxo de Conversa JARVIS

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant W as jarvis-web
    participant B as Web Speech API
    participant G as service-gateway
    participant AI as service-ai
    participant O as Ollama
    participant S as service-search
    participant DDG as DuckDuckGo

    U->>W: Fala ou digita
    opt Entrada por voz
        W->>B: STT gratuito
        B-->>W: Texto transcrito
    end
    W->>G: POST /api/chat/message
    G->>AI: Forward
    AI->>O: POST /api/chat + tools
    O-->>AI: Resposta + tool calls
    opt Busca necessária
        AI->>S: POST /api/search/web
        S->>DDG: Query
        DDG-->>S: Resultados
        S-->>AI: JSON
    end
    AI-->>G: Resposta JARVIS
    G-->>W: JSON
    opt Resposta falada
        W->>B: TTS gratuito
        B-->>U: Áudio
    end
    W-->>U: Texto + resultados
```

## Autenticação

```mermaid
sequenceDiagram
    participant W as jarvis-web
    participant G as service-gateway
    participant A as service-auth
    participant DB as PostgreSQL

    W->>G: POST /api/auth/login
    G->>A: Forward
    A->>DB: Validar credenciais
    DB-->>A: User
    A-->>G: JWT accessToken
    G-->>W: Token + user
    Note over W: Token em localStorage
    W->>G: Authorization: Bearer JWT
```

## Deploy Docker

```mermaid
flowchart LR
    subgraph DockerCompose["docker compose"]
        direction TB
        WEB_C[jarvis-web :3100]
        GW_C[service-gateway :3000]
        MS_C[6 microserviços]
        PG_C[(postgres)]
        RD_C[(redis)]
        OL_C[(ollama)]
    end

    WEB_C --> GW_C --> MS_C
    MS_C --> PG_C & RD_C
    MS_C --> OL_C
```

## Decisões de Design

- **Gateway único**: frontend nunca acessa serviços internos diretamente
- **Ports & Adapters**: Ollama, DuckDuckGo etc. são substituíveis sem alterar use cases
- **Sessões in-memory**: conversas em memória (Redis em produção futura)
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
