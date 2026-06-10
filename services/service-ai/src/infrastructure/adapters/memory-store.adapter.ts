import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ChatMessage } from '@myjarvis/shared';
import { ConversationStorePort, SearchClientPort } from '../../domain/ports/ai.port';

@Injectable()
export class InMemoryConversationStore implements ConversationStorePort {
  private sessions = new Map<string, ChatMessage[]>();

  getMessages(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId) ?? [];
  }

  addMessage(sessionId: string, message: ChatMessage): void {
    const messages = this.sessions.get(sessionId) ?? [];
    messages.push(message);
    this.sessions.set(sessionId, messages);
  }

  createSession(): string {
    const id = crypto.randomUUID();
    this.sessions.set(id, []);
    return id;
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
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.searchUrl}/api/search/${type}`, { query, limit: 5 }),
      );
      return (response.data as { data: unknown[] }).data ?? [];
    } catch {
      return [];
    }
  }
}
