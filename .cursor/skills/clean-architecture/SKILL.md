---
name: clean-architecture
description: Clean Architecture para microserviços NestJS do MyJarvis — camadas domain, application, infrastructure e presentation. Use ao criar use cases, ports, adapters ou documentar camadas com Mermaid.
---

# Clean Architecture — Microserviços

Skill correspondente à regra `.cursor/rules/clean-architecture.mdc`.

## Camadas

```mermaid
flowchart TB
    subgraph Presentation["presentation/"]
        CTRL[Controllers]
        DTO_SW[DTOs Swagger]
        MOD[NestJS Modules]
    end

    subgraph Application["application/"]
        UC[Use Cases]
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
```

## Regras de Dependência

```mermaid
flowchart LR
    D[domain] --> A[application]
    A --> P[presentation]
    I[infrastructure] -.->|implements ports| D

    style D fill:#1e3a5f,stroke:#22d3ee
```

| Camada | Pode importar de |
|--------|------------------|
| domain | Apenas domain |
| application | domain |
| infrastructure | domain, application (ports) |
| presentation | application, domain (DTOs) |

## Fluxo de uma Request

```mermaid
sequenceDiagram
    participant C as Controller
    participant UC as Use Case
    participant P as Port
    participant A as Adapter

    C->>UC: execute(dto)
    UC->>P: método abstrato
    P->>A: implementação
    A-->>UC: resultado
    UC-->>C: response
```

## Exemplo de Use Case

```typescript
@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(AI_PORT) private readonly ai: AiPort,
    @Inject(CONVERSATION_STORE) private readonly store: ConversationStorePort,
  ) {}

  async execute(dto: SendMessageDto): Promise<SendMessageOutput> {
    const sessionId = dto.sessionId ?? this.store.createSession();
    const history = this.store.getMessages(sessionId);
    return this.ai.generateResponse(history, dto.message);
  }
}
```

## Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Use case | `{Verbo}{Entidade}UseCase` | `AuthenticateUserUseCase` |
| Port | `{Entidade}Port` | `AiPort`, `SearchPort` |
| Adapter | `{Tech}Adapter` | `OllamaAdapter` |
| Symbol DI | `{NOME}_PORT` | `AI_PORT` |

## Checklist ao Criar Feature

- [ ] Port em `domain/ports/`
- [ ] Use case em `application/use-cases/`
- [ ] Adapter em `infrastructure/`
- [ ] Controller fino em `presentation/`
- [ ] Binding DI no module

## Skills Relacionadas

- [solid-principles](solid-principles/SKILL.md)
- [nestjs-services](nestjs-services/SKILL.md)
- [project-architecture](project-architecture/SKILL.md)
