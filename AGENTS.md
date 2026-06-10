# MyJarvis — Agent Guidelines

## Project Structure

- `services/` — NestJS microservices (Clean Architecture)
- `frontends/jarvis-web/` — Next.js PWA
- `packages/shared/` — Shared types and DTOs
- `docs/` — Documentation, Postman, Insomnia collections

## When Modifying Code

1. Follow `.cursor/rules/` for architecture and coding standards
2. Update Swagger decorators on API changes
3. Update Vitest tests
4. Update `docs/postman/` and `docs/insomnia/` collections
5. Update relevant README files

## Key Commands

```bash
docker compose up -d --build   # Full stack
npm test                       # All tests
npm run dev -w jarvis-web      # Frontend only
```

## Architecture Principles

- SOLID, Clean Architecture, Clean Code
- Domain → Application → Infrastructure → Presentation
- Gateway as single external entry point
