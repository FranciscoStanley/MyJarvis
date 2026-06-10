import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JarvisAction } from '@myjarvis/shared';
import {
  AI_PORT,
  AiPort,
  CONVERSATION_STORE,
  ConversationStorePort,
  SEARCH_CLIENT,
  SearchClientPort,
} from '../../domain/ports/ai.port';

export interface SendMessageInput {
  message: string;
  sessionId?: string;
}

export interface SendMessageOutput {
  reply: string;
  sessionId: string;
  actions: JarvisAction[];
  searchResults?: unknown[];
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(AI_PORT) private readonly ai: AiPort,
    @Inject(CONVERSATION_STORE) private readonly store: ConversationStorePort,
    @Inject(SEARCH_CLIENT) private readonly search: SearchClientPort,
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    const sessionId = input.sessionId ?? this.store.createSession();
    const history = this.store.getMessages(sessionId);

    this.store.addMessage(sessionId, {
      id: uuidv4(),
      role: 'user',
      content: input.message,
      timestamp: new Date(),
    });

    const { reply, actions } = await this.ai.generateResponse(history, input.message);

    let enrichedReply = reply;
    const searchResults: unknown[] = [];

    for (const action of actions) {
      if (action.query) {
        const typeMap: Record<string, string> = {
          search: 'web',
          image: 'images',
          video: 'videos',
          music: 'music',
        };
        const results = await this.search.search(typeMap[action.type] ?? 'web', action.query);
        searchResults.push(...results);
        if (results.length > 0) {
          enrichedReply += `\n\nEncontrei ${results.length} resultado(s) para "${action.query}".`;
        }
      }
    }

    this.store.addMessage(sessionId, {
      id: uuidv4(),
      role: 'assistant',
      content: enrichedReply,
      timestamp: new Date(),
      metadata: { actions, searchResults: searchResults.length },
    });

    return { reply: enrichedReply, sessionId, actions, searchResults: searchResults.length ? searchResults : undefined };
  }
}

@Injectable()
export class GetConversationUseCase {
  constructor(
    @Inject(CONVERSATION_STORE) private readonly store: ConversationStorePort,
  ) {}

  execute(sessionId: string) {
    return this.store.getMessages(sessionId);
  }
}

@Injectable()
export class CreateSessionUseCase {
  constructor(
    @Inject(CONVERSATION_STORE) private readonly store: ConversationStorePort,
  ) {}

  execute() {
    return { sessionId: this.store.createSession() };
  }
}
