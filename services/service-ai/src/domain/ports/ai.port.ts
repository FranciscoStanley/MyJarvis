import { ChatMessage, JarvisAction, SearchResult } from '@myjarvis/shared';

export interface AiPort {
  generateResponse(
    messages: ChatMessage[],
    userMessage: string,
  ): Promise<{ reply: string; actions: JarvisAction[] }>;

  synthesizeWithResults(
    userMessage: string,
    searchResults: SearchResult[],
    actionTypes: string[],
  ): Promise<string>;
}

export const AI_PORT = Symbol('AI_PORT');

export interface ConversationStorePort {
  getMessages(sessionId: string): ChatMessage[];
  addMessage(sessionId: string, message: ChatMessage): void;
  createSession(): string;
}

export const CONVERSATION_STORE = Symbol('CONVERSATION_STORE');

export interface SearchClientPort {
  search(type: string, query: string): Promise<unknown[]>;
}

export const SEARCH_CLIENT = Symbol('SEARCH_CLIENT');
