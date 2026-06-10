---
name: solid-principles
description: Princípios SOLID e Clean Code para o MyJarvis. Use ao revisar código, nomear classes, refatorar funções longas ou garantir injeção de dependência correta em TypeScript/TSX.
---

# SOLID & Clean Code

Skill correspondente à regra `.cursor/rules/solid-principles.mdc`.

## Single Responsibility (S)

- Uma classe ou função = **uma razão para mudar**
- Controllers **só roteiam** — zero lógica de negócio
- Use cases concentram uma operação de negócio cada

```typescript
// ❌ Controller com lógica
@Post('login')
async login(@Body() dto) {
  const hash = await bcrypt.hash(dto.password, 12); // errado aqui
}

// ✅ Controller delega
@Post('login')
async login(@Body() dto: LoginRequestDto) {
  return this.authenticateUser.execute(dto);
}
```

## Open/Closed (O)

- Estender via **interfaces + DI**, não modificando use cases
- Novo provider de IA? Crie `NewAiAdapter implements AiPort` — use case intacto

## Liskov Substitution (L)

- Qualquer implementação de port deve ser **intercambiável**
- Testes usam mocks que respeitam o contrato do port

## Interface Segregation (I)

- Ports **pequenos e focados** — não um `GodPort` com 20 métodos
- Exemplos no projeto: `AiPort`, `SearchPort`, `VoicePort`, `NotificationRepositoryPort`

## Dependency Inversion (D)

- Use cases dependem de **abstrações** (`@Inject(AI_PORT)`)
- Implementações concretas ficam em infrastructure

## Clean Code

| Regra | Prática |
|-------|---------|
| Tamanho | Funções ≤ 30 linhas quando possível |
| Nomes | `generateJarvisResponse`, não `process` ou `handle` |
| Magic numbers | Constantes em `domain/constants/` |
| Erros | Exceptions de domínio ou NestJS (`NotFoundException`) |
| Logs | Estruturados com `requestId`, `userId`, `service` |

## Anti-patterns a Evitar

- Importar TypeORM/OpenAI/axios dentro de use cases
- DTOs com lógica de validação de negócio complexa (validação de formato OK)
- Services God class com 500+ linhas
- `any` sem justificativa

## Skills Relacionadas

- [clean-architecture](clean-architecture/SKILL.md) — onde aplicar SOLID nas camadas
- [nestjs-services](nestjs-services/SKILL.md) — DI no NestJS
