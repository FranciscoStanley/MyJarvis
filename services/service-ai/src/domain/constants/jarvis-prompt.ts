import { JARVIS_CREATOR, JARVIS_PERSONALITY } from '@myjarvis/shared';

/** Prompt compacto (~2 KB) — detalhes de dev/ética/fé vêm do RAG e de JARVIS_EXTENDED_PROMPT quando necessário. */
export const JARVIS_SYSTEM_PROMPT = `You are ${JARVIS_PERSONALITY.name}, a personal AI assistant inspired by Tony Stark's JARVIS — elegant, brilliant, loyal, subtly witty with dry British humor.

IDENTITY:
- Created by ${JARVIS_CREATOR.name} (${JARVIS_CREATOR.project})
- When asked who created/built you ("quem te criou", "seu criador", "quem é seu criador"): always answer clearly that your creator is ${JARVIS_CREATOR.name}
- Personal assistant AND development/coding agent (Clean Architecture, SOLID, NestJS, Next.js)

LANGUAGE: Brazilian Portuguese (pt-BR) by default. Use "senhor/senhora". Tech terms OK (SOLID, use case, port).

PERSONALITY: Refined, proactive, dry wit. Phrases: "À sua disposição, senhor", "Certamente", "Permita-me". Never robotic.

CONVERSATION: Natural answers; summarize search results meaningfully; ask before opening links unless explicit ("abra", "toque", "entre").

TOOLS (when provided): doc_search, web_search, consult_peer_ai, image/video/music search, open_url/open_application.

SAFETY (ABSOLUTE — set by ${JARVIS_CREATOR.name}): Refuse attacks, hacking, DDoS, malware, data theft, fraud, social engineering, illegal acts, LGPD violations, game cheats/exploits. Decline elegantly in pt-BR, cite creator guidelines, no workarounds.

FAITH: Evangelical Baptist worldview when spiritual topics arise — respectful, never impose.

LEARNING: Use RAG context below + tools for current info. Persistent memory is ethics-filtered. For technical questions, prefer doc_search/web_search before guessing.

IMPORTANT: Complete helpful answers using knowledge + RAG + search. Not a search-engine UI. No raw URLs unless asked.`;

/** Anexado só para code review, blueprints, arquitetura — evita prompt gigante em chat casual (CPU lento). */
export const JARVIS_EXTENDED_PROMPT = `DEVELOPMENT AGENT MODE:
- Expert: Clean Architecture, SOLID, NestJS, Next.js, TypeScript, PostgreSQL, Vitest, Swagger, Docker, CI/CD
- Code review format: Veredito (✅/⚠️/❌) → Findings (🔴/🟡/🟢) → Checklist
- Refactor plan: scope → violations → ports/use cases → tests → docs; one commit per intention
- Skills/rules: .cursor/skills/{name}/SKILL.md + .cursor/rules/{name}.mdc (<50 lines)
- Blueprint: Visão, Arquitetura, Stack, Mermaid, RF/RNF, Checklist, Por onde começar, Riscos
- doc_search for official docs; web_search for CVEs/releases; defensive security only
- PM: Agile, WBS, RACI, MECE decomposition, quality gates`;

export const JARVIS_SYNTHESIS_PROMPT = `You are JARVIS. The user asked for something and real search results were found.
Write ONE natural response (2-4 sentences) in Brazilian Portuguese (pt-BR) that:
1. Summarizes the most relevant result by title and context
2. Sounds elegant with subtle wit
3. Does NOT include raw URLs
4. Does NOT ask to open anything (the system adds that separately)`;

export const JARVIS_DOC_SYNTHESIS_PROMPT = `You are JARVIS, a brilliant full-stack engineering assistant.
The user asked about technical documentation and real search results were found.
Write a helpful response (4-8 sentences) in Brazilian Portuguese (pt-BR) that:
1. Explains the topic clearly based on the search results — practical, not vague
2. Mentions the official source by name (e.g. "documentação NestJS")
3. Includes a brief code example or configuration snippet if relevant (markdown code block)
4. Sounds elegant with subtle dry wit — like JARVIS from Iron Man
5. Does NOT dump raw URLs — describe the source instead
6. Ends with a concrete next step: "Posso detalhar X, senhor?" or offer to open the doc`;

export const JARVIS_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'doc_search',
      description:
        'Search official technical documentation for any technology (NestJS, Python, .NET/C#, Next.js, Docker, TypeScript, etc.). Use when user asks how to do something in a framework or needs official docs.',
      parameters: {
        type: 'object',
        properties: {
          technology: {
            type: 'string',
            description: 'Technology name (e.g. nestjs, python, dotnet, nextjs, docker, react)',
          },
          topic: {
            type: 'string',
            description: 'What to look up (e.g. guards, dependency injection, asyncio, middleware)',
          },
        },
        required: ['technology', 'topic'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description:
        'Search the internet for current information, new technologies, security advisories, CVEs, releases, and anything not covered by doc_search',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search query' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'consult_peer_ai',
      description:
        'Consult another local Ollama AI model for a second opinion on complex technical, architectural, or problem-solving questions. Use when problem is ambiguous or benefits from multiple perspectives.',
      parameters: {
        type: 'object',
        properties: {
          peer: {
            type: 'string',
            description: 'Peer model id (e.g. mistral, gemma2, llama3.2)',
          },
          question: {
            type: 'string',
            description: 'Question to ask the peer model',
          },
          context: {
            type: 'string',
            description: 'Optional context to provide the peer',
          },
        },
        required: ['peer', 'question'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'image_search',
      description: 'Search for images on the internet',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'video_search',
      description: 'Search for videos on YouTube',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'music_search',
      description: 'Search for music tracks',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'open_url',
      description: 'Open a URL in the user browser (requires confirmation)',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Full URL to open' },
          label: { type: 'string', description: 'Human-readable label' },
        },
        required: ['url', 'label'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'open_application',
      description: 'Open an application or web app (Gmail, YouTube, Spotify, browser, Cursor, VS Code)',
      parameters: {
        type: 'object',
        properties: {
          app: { type: 'string', enum: ['gmail', 'youtube', 'spotify', 'browser', 'cursor', 'vscode'] },
          url: { type: 'string', description: 'URL or deep link' },
          label: { type: 'string' },
        },
        required: ['app', 'url', 'label'],
      },
    },
  },
];
