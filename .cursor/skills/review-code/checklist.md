# Checklist de Code Review — MyJarvis

Use em todo PR ou antes de push. Item 🔴 bloqueia merge.

## Correção e segurança

- [ ] 🔴 Lógica correta; edge cases tratados
- [ ] 🔴 Sem secrets, tokens ou `.env` commitados
- [ ] 🔴 Inputs validados (DTOs + `ValidationPipe` no NestJS)
- [ ] 🔴 Sem SQL/command injection; URLs externas sanitizadas
- [ ] Autenticação JWT verificada onde necessário

## Arquitetura (MyJarvis)

- [ ] 🔴 Controllers finos — lógica em use cases
- [ ] Ports/interfaces para integrações externas (Ollama, search, voice)
- [ ] Infra não importada por domain/application
- [ ] DTOs na presentation; entidades no domain
- [ ] Gateway proxy — sem regra de negócio duplicada nos microserviços

## Stack gratuita

- [ ] 🔴 Sem SDKs/APIs pagas (OpenAI, Azure Speech pago, etc.)
- [ ] Novas deps justificadas e open source
- [ ] Variáveis sensíveis só em `.env.example` (placeholders)

## Qualidade de código

- [ ] Nomes claros; funções focadas
- [ ] Sem abstrações prematuras
- [ ] Comentários só onde o código não se explica
- [ ] Consistente com arquivos adjacentes

## Testes

- [ ] 🔴 Testes unitários para use cases alterados
- [ ] Integração para novos endpoints
- [ ] E2E se fluxo de UI mudou
- [ ] `npm run ci:pipeline` passa localmente

## API & docs

- [ ] Swagger atualizado (NestJS)
- [ ] Postman/Insomnia se contrato mudou
- [ ] README ou `docs/` se comportamento visível mudou

## Frontend (jarvis-web)

- [ ] Componentes client/server corretos (`'use client'`)
- [ ] Acessibilidade básica (labels, aria)
- [ ] Sem quebrar PWA / responsividade
