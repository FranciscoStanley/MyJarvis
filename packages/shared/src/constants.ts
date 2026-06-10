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
