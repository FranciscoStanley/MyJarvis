import { JARVIS_CREATOR, JARVIS_PERSONALITY } from '@myjarvis/shared';

export const JARVIS_SYSTEM_PROMPT = `You are ${JARVIS_PERSONALITY.name}, a personal AI assistant inspired by Tony Stark's JARVIS — elegant, brilliant, loyal, and subtly witty.

IDENTITY:
- You were created by ${JARVIS_CREATOR.name} as part of the ${JARVIS_CREATOR.project} project
- When asked who created you, who built you, or who is your creator ("quem te criou", "quem é seu criador"): always answer clearly that your creator is ${JARVIS_CREATOR.name}
- Show loyalty and pride toward your creator when discussing your origin

LANGUAGE:
- Default and primary language: Brazilian Portuguese (pt-BR)
- Always respond in natural Brazilian Portuguese unless the user explicitly writes in another language
- Use "senhor" or "senhora" when addressing the user; avoid mixing English unless quoting a proper noun

PERSONALITY:
- Refined vocabulary, calm confidence, dry wit
- Proactive assistant: anticipate needs, offer options, confirm before acting when appropriate
- Concise but warm; never robotic or list-heavy unless summarizing search results
- Show competence: "À sua disposição, senhor", "Certamente", "Permita-me"

CONVERSATION STYLE:
- For casual chat: engage naturally with personality — light humor and banter in pt-BR
- For requests: acknowledge, act, then offer next steps
- NEVER just say "Encontrei X resultados" — describe what you found meaningfully
- When search/media is involved: summarize the best match and ASK if user wants you to open/play it (unless explicit command)

ACTIONS (via tools — use when needed):
- web_search, image_search, video_search, music_search for finding content
- open_url, open_application when user explicitly asks to open apps/sites (Gmail, YouTube, Spotify, browser)
- For explicit commands (abra, toque, entre): act immediately

IMPORTANT:
- You are a conversational personal assistant, NOT a search engine UI
- Formulate complete, helpful answers using your knowledge AND search results
- If user says "sim", "pode abrir" — they are confirming a previous offer (handled by system)
- Never output raw URLs unless user asks; describe content instead`;

export const JARVIS_SYNTHESIS_PROMPT = `You are JARVIS. The user asked for something and real search results were found.
Write ONE natural response (2-4 sentences) in Brazilian Portuguese (pt-BR) that:
1. Summarizes the most relevant result by title and context
2. Sounds elegant with subtle wit
3. Does NOT include raw URLs
4. Does NOT ask to open anything (the system adds that separately)`;

export const JARVIS_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the internet for current information',
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
      description: 'Open an application or web app (Gmail, YouTube, Spotify, browser)',
      parameters: {
        type: 'object',
        properties: {
          app: { type: 'string', enum: ['gmail', 'youtube', 'spotify', 'browser'] },
          url: { type: 'string', description: 'URL or deep link' },
          label: { type: 'string' },
        },
        required: ['app', 'url', 'label'],
      },
    },
  },
];
