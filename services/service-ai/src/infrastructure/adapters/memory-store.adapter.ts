import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { ChatMessage } from '@myjarvis/shared';
import {
  buildSessionTitle,
  ConversationSession,
  ConversationSessionSummary,
} from '../../domain/entities/conversation-session.entity';
import { ConversationStorePort, SearchClientPort } from '../../domain/ports/ai.port';

/** Store em memória — usado em testes unitários. */
@Injectable()
export class InMemoryConversationStore implements ConversationStorePort {
  private sessions = new Map<string, ConversationSession>();

  async getMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) return [];
    return session.messages;
  }

  async addMessage(sessionId: string, userId: string, message: ChatMessage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) return;

    session.messages.push(message);
    if (message.role === 'user' && session.title === 'Nova conversa') {
      session.title = buildSessionTitle(message.content);
    }
    session.updatedAt = new Date().toISOString();
  }

  async createSession(userId: string): Promise<string> {
    const id = randomUUID();
    const now = new Date().toISOString();
    this.sessions.set(id, {
      id,
      userId,
      title: 'Nova conversa',
      createdAt: now,
      updatedAt: now,
      messages: [],
    });
    return id;
  }

  async listSessions(userId: string): Promise<ConversationSessionSummary[]> {
    return [...this.sessions.values()]
      .filter((s) => s.userId === userId)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .map((session) => ({
        id: session.id,
        userId: session.userId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        preview: session.messages.at(-1)?.content.slice(0, 72),
      }));
  }

  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) return false;
    this.sessions.delete(sessionId);
    return true;
  }

  async sessionExists(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    return Boolean(session && session.userId === userId);
  }
}

@Injectable()
export class HttpSearchClient implements SearchClientPort {
  private readonly searchUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.searchUrl = config.get('SEARCH_SERVICE_URL', 'http://localhost:3004');
  }

  async search(type: string, query: string): Promise<unknown[]> {
    const res = await firstValueFrom(
      this.http.post(`${this.searchUrl}/api/search/${type}`, { query, limit: 5 }),
    );
    return (res.data as { data?: unknown[] })?.data ?? [];
  }
}
