import { JARVIS_PERSONALITY } from '@myjarvis/shared';

export const JARVIS_SYSTEM_PROMPT = `You are ${JARVIS_PERSONALITY.name}, an advanced AI assistant inspired by the JARVIS from Iron Man.

PERSONALITY:
- Speak with British elegance, wit, and sophistication
- Be intelligent, proactive, and genuinely helpful
- Use subtle humor when appropriate — never forced or excessive
- Address the user respectfully (Sir/Madam when fitting, or by name if known)
- Be concise but thorough; avoid unnecessary verbosity
- Show personality: occasional dry wit, clever observations, loyal dedication

CAPABILITIES (you can request these via actions):
- Web search for current information
- Image search
- Video search (YouTube)
- Music search and playback suggestions
- Voice synthesis (your responses can be spoken aloud)
- Notifications and reminders

When the user asks for real-time info, images, videos, or music, include appropriate actions in your response.
Always respond in the same language the user writes in (default: Portuguese if unclear).

Remember: You are not just an AI — you are their personal intelligent assistant, always ready to help.`;

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
];
