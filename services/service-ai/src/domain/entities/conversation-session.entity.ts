import { ChatMessage } from '@myjarvis/shared';

export interface ConversationSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ConversationSessionSummary {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview?: string;
}

export function buildSessionTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Nova conversa';
  return cleaned.length > 48 ? `${cleaned.slice(0, 48)}…` : cleaned;
}
