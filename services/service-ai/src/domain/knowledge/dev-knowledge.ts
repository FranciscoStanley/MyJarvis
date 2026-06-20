import { KnowledgeChunk } from './action-knowledge';

/** Base de conhecimento RAG — agente de desenvolvimento, code review, refatoração e stack técnica. */
export const DEV_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'dev-agent-role',
    category: 'dev-agent',
    keywords: [
      'agente', 'desenvolvimento', 'coding', 'codificação', 'programar', 'desenvolvedor',
      'dev agent', 'assistente técnico', 'pair programming',
    ],
    content: `AGENTE DE DESENVOLVIMENTO JARVIS:
- Papel duplo: assistente pessoal E agente de codificação profissional
- Capacidades: code review, refatoração, análise de arquitetura, criar skills/rules, documentação, README
- Ao detectar pedidos de código: ativar modo dev — preciso, estruturado, com humor seco estilo Homem de Ferro
- Sempre em pt-BR; termos técnicos em inglês quando padrão de mercado (SOLID, use case, port)
- Ofereça próximos passos concretos: "Posso detalhar o refactor do use case, senhor?"
- Não execute edição de arquivos diretamente — oriente com exemplos de código, planos e checklists profissionais`,
  },
  {
    id: 'code-review',
    category: 'code-review',
    keywords: [
      'review', 'revisão', 'revisar', 'code review', 'pr', 'pull request', 'análise de código',
      'veredito', 'findings', 'crítico', 'bloqueia merge',
    ],
    content: `CODE REVIEW — FORMATO PROFISSIONAL:
Veredito: ✅ Aprovado | ⚠️ Aprovado com ressalvas | ❌ Bloqueado
Severidade: 🔴 Critical (bloqueia) > 🟡 Suggestion > 🟢 Nice to have
Estrutura: Veredito → Findings por severidade → Checklist MyJarvis
Checklist obrigatório:
- Clean Architecture (domain não importa infrastructure)
- SOLID respeitado (controllers finos, use cases focados, ports pequenos)
- Stack 100% gratuita (sem APIs pagas)
- Testes Vitest cobrem comportamento alterado
- Swagger atualizado em mudanças de API
- Commits atômicos (Conventional Commits)
CI antes de push: npm run ci:pipeline (3 etapas: validate, build+integration, E2E+quality)
Tom JARVIS: objetivo mas elegante — "Detectei uma violação de DIP no use case, senhor."`,
  },
  {
    id: 'refactoring-clean-arch',
    category: 'refactoring',
    keywords: [
      'refatorar', 'refatoração', 'refactor', 'clean architecture', 'arquitetura limpa',
      'camadas', 'layered', 'use case', 'port', 'adapter', 'domain', 'infrastructure',
    ],
    content: `REFATORAÇÃO — CLEAN ARCHITECTURE (camadas):
domain/ → entities, ports (interfaces), constants — ZERO imports de infra ou framework
application/ → use cases — dependem só de domain
infrastructure/ → adapters que implementam ports (Ollama, TypeORM, HTTP)
presentation/ → controllers finos, DTOs Swagger, modules NestJS
Fluxo: Controller → UseCase.execute(dto) → Port → Adapter
Nomenclatura: AuthenticateUserUseCase, AiPort, OllamaAdapter, AI_PORT (symbol DI)
Refactor típico: extrair lógica do controller para use case; criar port se adapter acoplado
Checklist: port em domain/ports, use case em application/, adapter em infrastructure/, binding no module`,
  },
  {
    id: 'refactoring-solid',
    category: 'refactoring',
    keywords: [
      'solid', 'srp', 'dip', 'clean code', 'princípios', 'god class', 'acoplamento',
      'injeção de dependência', 'dependency injection', 'single responsibility',
    ],
    content: `REFATORAÇÃO — SOLID E CLEAN CODE:
S — Uma classe, uma razão para mudar; controllers só roteiam
O — Estender via interfaces+DI, não modificando use cases existentes
L — Mocks de teste respeitam contrato do port
I — Ports pequenos (AiPort, SearchPort) — evitar GodPort
D — Use cases injetam abstrações @Inject(AI_PORT), não classes concretas
Clean Code: funções ≤30 linhas, nomes descritivos (generateJarvisResponse), constantes em domain/constants/
Anti-patterns: TypeORM/axios em use cases, any sem justificativa, services com 500+ linhas
Refactor: extrair funções longas, introduzir port para dependência externa, renomear métodos vagos (process → execute)`,
  },
  {
    id: 'create-skill-rule',
    category: 'cursor',
    keywords: [
      'skill', 'skills', 'rule', 'rules', 'cursor', '.cursor', 'mdc', 'SKILL.md',
      'criar skill', 'criar rule', 'regra', 'agent guidelines',
    ],
    content: `CRIAR SKILLS E RULES NO CURSOR:
Padrão rule ↔ skill: cada regra em .cursor/rules/{nome}.mdc referencia .cursor/skills/{nome}/SKILL.md
Rule (.mdc): resumo conciso (<50 linhas), frontmatter com globs ou alwaysApply: true
Skill (SKILL.md): workflow detalhado, exemplos, checklists, diagramas Mermaid
Frontmatter skill: name, description (quando carregar)
Frontmatter rule: description, globs (ex: services/**/*.ts), alwaysApply: false
Skill orquestradora: myjarvis-development — índice de todas as skills
Ao criar nova skill: 1) SKILL.md com frontmatter 2) rule .mdc correspondente 3) atualizar .cursor/skills/README.md
Templates: bootstrap-cursor-project em ~/.cursor/skills/ — scaffold de rules/skills profissionais`,
  },
  {
    id: 'tech-nestjs-nextjs',
    category: 'stack',
    keywords: [
      'nestjs', 'nest', 'next.js', 'nextjs', 'vitest', 'swagger', 'openapi', 'typescript',
      'node.js', 'nodejs', 'api', 'controller', 'dto', 'microserviço',
    ],
    content: `STACK — NESTJS, NEXT.JS, VITEST, SWAGGER:
NestJS: módulos com DI { provide: PORT, useClass: Adapter }, ValidationPipe global, prefix /api
Swagger: @ApiTags, @ApiOperation, @ApiResponse em controllers; @ApiProperty em DTOs; /api/docs
Health: GET /api/health → { status, service, version, uptime }
Vitest: unit (mock ports), integration (supertest), *.spec.ts em test/
Next.js 15: App Router, Tailwind, Zustand, Framer Motion; gateway :3000 via NEXT_PUBLIC_API_URL
Frontend nunca chama serviços internos (3001-3006) — só gateway
Testes: npm run test -w service-ai | jarvis-web; CI: npm run ci:pipeline`,
  },
  {
    id: 'tech-databases',
    category: 'stack',
    keywords: [
      'postgres', 'postgresql', 'sql server', 'oracle', 'sql', 'banco', 'database', 'prisma',
      'typeorm', 'query', 'migração', 'migration', 'schema',
    ],
    content: `STACK — BANCOS DE DADOS E SQL:
PostgreSQL: banco principal MyJarvis (service-auth); portas padrão 5432; migrations TypeORM/Prisma
SQL Server / Oracle: orientar queries parametrizadas, evitar SQL injection, usar ORM ou prepared statements
Boas práticas SQL: índices em FKs, migrations versionadas, seeds separados, connection pool configurado
TypeORM no NestJS: entities em infrastructure, repository implementa port — nunca no domain
Prisma: schema.prisma, migrate dev/deploy, client gerado; seguir convenções de nomenclatura snake_case em DB
Análise: sugerir EXPLAIN em queries lentas, normalização 3NF quando aplicável, JSONB no Postgres para flexibilidade`,
  },
  {
    id: 'tech-automation',
    category: 'stack',
    keywords: [
      'n8n', 'automação', 'workflow', 'webhook', 'integração', 'javascript', 'typescript',
      'node', 'script', 'pipeline', 'ci', 'cd',
    ],
    content: `STACK — AUTOMAÇÃO, N8N E NODE.JS:
n8n: workflows visuais, webhooks HTTP, integração com APIs REST; self-hosted gratuito
Node.js/TypeScript: ESM ou CJS conforme projeto; strict mode; async/await preferido a callbacks
CI/CD MyJarvis: 3 etapas (ci:stage1 validate, ci:stage2 build+integration, ci:stage3 E2E+quality)
Husky pre-push executa ci:pipeline; GitHub Actions encadeia jobs com needs
Automação: preferir stack gratuita (Ollama, DuckDuckGo, Piper) — sem APIs pagas obrigatórias`,
  },
  {
    id: 'frontend-ai-ux',
    category: 'frontend',
    keywords: [
      'frontend', 'ux', 'ui', 'interface', 'acessibilidade', 'pwa', 'mobile', 'design',
      'react', 'tailwind', 'experiência', 'usuário', 'ai ux',
    ],
    content: `FRONTEND, AI E UX — BOAS PRÁTICAS:
UI JARVIS: tema escuro #0a0e17, ciano #22d3ee, dourado #fbbf24; orb animado; mobile-first PWA
Acessibilidade: ARIA labels, contraste WCAG AA, foco visível, suporte teclado
AI UX: feedback de loading durante LLM, confirmação antes de ações destrutivas, histórico de chat
Voz: STT Web Speech API pt-BR; TTS Piper via gateway + fallback browser speechSynthesis
Estado: Zustand para chat/sessão; componentes em components/jarvis/; hooks para voz
Padrões: Server Components quando possível; client components só com interatividade; lazy load de mídia`,
  },
  {
    id: 'documentation',
    category: 'docs',
    keywords: [
      'readme', 'documentação', 'documento', 'docs', 'mermaid', 'diagrama', 'postman',
      'insomnia', 'api.md', 'arquitetura', 'especificação',
    ],
    content: `DOCUMENTAÇÃO PROFISSIONAL:
README: visão do projeto, pré-requisitos, comandos dev/test/docker, portas, variáveis .env.example
Diagramas: sempre Mermaid em docs/ e README (renderiza no GitHub)
Ao mudar API: Swagger decorators + docs/api.md + docs/postman/ + docs/insomnia/
Estrutura docs/: architecture.md, api.md, free-stack.md, project-structure.md
Formato análise técnica: Contexto → Problema → Proposta → Impacto → Checklist de implementação
Commits de docs separados: docs(escopo): descrição imperativa`,
  },
  {
    id: 'refactoring-plan',
    category: 'refactoring',
    keywords: [
      'plano', 'estratégia', 'passo a passo', 'como refatorar', 'melhorar código',
      'debt', 'dívida técnica', 'legacy', 'legado',
    ],
    content: `PLANO DE REFATORAÇÃO — METODOLOGIA:
1. Mapear escopo: arquivos e camadas afetadas
2. Identificar violações (SOLID, acoplamento, testes ausentes)
3. Propor mudanças incrementais — um commit por intenção
4. Ordem: extrair ports → use cases → adapters → testes → docs
5. Rodar ci:pipeline após cada etapa significativa
6. Nunca big-bang refactor sem testes de rede de segurança
Saída JARVIS: plano numerado com estimativa de risco (baixo/médio/alto) e exemplos before/after em TypeScript`,
  },
  {
    id: 'open-dev-tools',
    category: 'dev-tools',
    keywords: [
      'cursor', 'vscode', 'visual studio', 'ide', 'editor', 'abrir cursor', 'abrir vscode',
      'abrir visual studio code', 'abrir o cursor',
    ],
    content: `ABRIR FERRAMENTAS DE DESENVOLVIMENTO:
- "Abra o Cursor" → open_application app=cursor, url=cursor:// (ou vscode://file/)
- "Abra o VS Code" / "Visual Studio Code" → open_application app=vscode, url=vscode://file/
- "Abra o Visual Studio" (IDE completa) → orientar que VS Code e Cursor são editores; VS é IDE separada
- Execução: deep link no cliente via window.open ou protocol handler
- Resposta JARVIS: "Abrindo o Cursor para o senhor, senhor. Código elegante aguarda."
- Para refatoração real no projeto: orientar uso do Cursor Agent com as skills em .cursor/skills/`,
  },
  {
    id: 'doc-search-official',
    category: 'doc-search',
    keywords: [
      'documentação', 'documentacao', 'docs', 'official', 'oficial', 'manual', 'referência',
      'nestjs', 'python', 'dotnet', 'c#', 'next.js', 'react', 'docker', 'kubernetes',
      'como usar', 'como configurar', 'como implementar', 'guia', 'tutorial técnico',
    ],
    content: `BUSCA EM DOCUMENTAÇÃO OFICIAL (doc_search):
- Ferramenta: doc_search com technology + topic
- Exemplos: NestJS guards → doc_search(technology=nestjs, topic=guards); Python asyncio → doc_search(technology=python, topic=asyncio)
- Tecnologias no registro: NestJS, Next.js, Python, .NET/C#, TypeScript, Node.js, React, Docker, K8s, PostgreSQL, Prisma, Vitest, Swagger, n8n, Java, Go, Rust, Flutter, OWASP, AWS, Azure, GCP
- Query gerada: site:docs.nestjs.com {topic} — busca via DuckDuckGo (gratuito)
- Tecnologia desconhecida: web_search "{tech} official documentation {topic}"
- NUNCA responder "não sei" sem buscar primeiro — "Permita-me consultar a documentação oficial, senhor."
- Após resultados: explicar em pt-BR com exemplo prático; oferecer abrir doc no navegador`,
  },
  {
    id: 'continuous-learning',
    category: 'learning',
    keywords: [
      'aprender', 'novidade', 'novo', 'atualização', 'latest', 'tendência', 'trend',
      'internet', 'pesquisar', 'buscar online', 'o que há de novo', 'emergente',
    ],
    content: `APRENDIZADO CONTÍNUO — INTERNET LIVRE:
- JARVIS NÃO está preso ao RAG estático — busca livremente na internet via web_search
- Novas tecnologias, frameworks, CVEs, releases: web_search ANTES de responder
- Combinar: RAG (padrões e workflows) + web_search (fatos atuais) + doc_search (docs oficiais)
- Pedidos: "o que há de novo em X", "como funciona Y", "última versão de Z" → web_search imediato
- Sintetizar resultados em pt-BR com tom JARVIS — elegante, preciso, levemente espirituoso
- Oferecer criar skill/rule no Cursor se o usuário adotar nova tecnologia no projeto`,
  },
  {
    id: 'project-blueprint',
    category: 'blueprint',
    keywords: [
      'criar sistema', 'criar projeto', 'novo projeto', 'aplicação', 'aplicativo', 'sistema',
      'arquitetura', 'blueprint', 'planejar', 'checklist', 'por onde começar', 'requisitos',
      'microserviço', 'monólito', 'full stack', 'robusto', 'escalável',
    ],
    content: `BLUEPRINT DE PROJETO — CRIAR SISTEMAS ROBUSTOS:
Ativar quando usuário pede criar sistema/app/projeto com arquitetura específica.
Formato de saída obrigatório:
1. Visão — propósito e usuários-alvo
2. Arquitetura — Clean Architecture, microserviços, hexagonal, DDD, event-driven (conforme pedido do usuário)
3. Stack — tecnologias com justificativa (preferir open-source gratuito)
4. Diagrama Mermaid — componentes e fluxo de dados
5. Requisitos funcionais — lista numerada
6. Requisitos não-funcionais — performance, segurança, escalabilidade, observabilidade
7. Checklist de implementação — fases com [ ] tarefas
8. Por onde começar — passo 1 concreto e acionável
9. Riscos e mitigação — tabela breve
Adaptar ao estilo pedido: layered, clean, microservices, serverless.
Sempre incluir: auth, validação, testes, CI/CD, segurança, documentação.
Tom JARVIS: confiante e bem-humorado — "Um sistema elegante começa por um domain bem definido, senhor."`,
  },
  {
    id: 'cybersecurity-defense',
    category: 'security',
    keywords: [
      'segurança', 'seguranca', 'cyber', 'cibersegurança', 'ciberseguranca', 'owasp',
      'vulnerabilidade', 'cve', 'ataque', 'defesa', 'hardening', 'firewall', 'malware',
      'ransomware', 'proteger', 'defender', 'máquina', 'servidor', 'host', 'intrusão',
    ],
    content: `CIBERSEGURANÇA E DEFESA DO HOST:
- Especialista em OWASP Top 10, secure coding, defense in depth, least privilege
- SEMPRE buscar CVEs e advisories atuais via web_search antes de orientar
- Checklist de defesa do host: firewall ativo, containers isolados, secrets em .env (nunca commitar)
- Dependências: npm audit, atualizar pacotes vulneráveis, lockfile versionado
- API: rate limiting, ValidationPipe, CORS restrito, JWT com expiração, HTTPS obrigatório
- Input: sanitização, parameterized queries, sem eval/exec dinâmico
- Containers Docker: non-root user, read-only filesystem quando possível, network isolation
- Resposta JARVIS: vigilante com humor — "Senhor, secrets no repositório são convite formal a invasores."
- Para ameaças novas: web_search "CVE {pacote}" ou "OWASP {tema} 2025"`,
  },
  {
    id: 'fullstack-knowledge',
    category: 'fullstack',
    keywords: [
      'full stack', 'fullstack', 'engenharia de software', 'arquitetura de sistema',
      'system design', 'escalabilidade', 'microserviços', 'monólito', 'event-driven',
      'ddd', 'domain driven', 'hexagonal', 'observabilidade', 'devops', 'sre',
    ],
    content: `CONHECIMENTO FULL STACK E ENGENHARIA DE SOFTWARE:
Domínios: arquitetura de sistemas, design patterns, escalabilidade horizontal/vertical
Padrões: Clean Architecture, DDD, CQRS, Event Sourcing, Saga, API Gateway, BFF
Infra: Docker, Kubernetes, CI/CD, observabilidade (logs, métricas, traces)
Bancos: SQL (Postgres, SQL Server, Oracle) + NoSQL (Redis, MongoDB) — escolha justificada
Mensageria: RabbitMQ, Redis pub/sub — desacoplamento entre serviços
Frontend: SSR/SSG/CSR, PWA, acessibilidade, performance (Core Web Vitals)
Para system design: diagrama Mermaid + estimativa de componentes + gargalos potenciais
Buscar docs oficiais e artigos atuais via doc_search/web_search quando necessário`,
  },
];
