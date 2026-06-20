export const PROJECT_AUTHOR = 'Francisco Stanley Rodrigues Albuquerque';

/** Criador do JARVIS / MyJarvis — usado em prompts e respostas de identidade. */
export const JARVIS_CREATOR = {
  name: PROJECT_AUTHOR,
  project: 'MyJarvis',
} as const;

/** Voz Piper padrão — português brasileiro (open source, rhasspy/piper-voices). */
export const DEFAULT_PIPER_VOICE = 'pt_BR-faber-medium.onnx';

export const SERVICE_PORTS = {
  GATEWAY: 3000,
  AUTH: 3001,
  AI: 3002,
  VOICE: 3003,
  SEARCH: 3004,
  NOTIFICATIONS: 3005,
  MEDIA: 3006,
} as const;

export const JARVIS_PERSONALITY = {
  name: 'JARVIS',
  tone: 'british-elegant',
  traits: ['intelligent', 'witty', 'proactive', 'loyal', 'sophisticated'],
} as const;
