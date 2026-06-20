import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientAction,
  detectConfirmationIntent,
  getPendingClientActions,
  JarvisAction,
  SearchResult,
} from '@myjarvis/shared';
import {
  AI_PORT,
  AiPort,
  CONVERSATION_STORE,
  ConversationStorePort,
  SEARCH_CLIENT,
  SearchClientPort,
} from '../../domain/ports/ai.port';
import { buildClientActions, clientActionsFromJarvisActions } from '../../domain/services/client-action-builder';
import {
  buildConfirmationPrompt,
  buildConfirmedReply,
  buildDeclinedReply,
  synthesizeFallbackReply,
} from '../../domain/services/response-synthesizer';

export interface SendMessageInput {
  message: string;
  sessionId?: string;
}

export interface SendMessageOutput {
  reply: string;
  sessionId: string;
  actions: JarvisAction[];
  searchResults?: SearchResult[];
  clientActions?: ClientAction[];
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

    const confirmation = detectConfirmationIntent(input.message);
    const pending = getPendingClientActions(history);

    if (pending.length && confirmation !== 'none') {
      return this.handleConfirmation(sessionId, input.message, confirmation, pending);
    }

    this.store.addMessage(sessionId, {
      id: uuidv4(),
      role: 'user',
      content: input.message,
      timestamp: new Date(),
    });

    const { reply, actions } = await this.ai.generateResponse(history, input.message);

    const searchResults: SearchResult[] = [];
    const actionTypes: string[] = [];

    for (const action of actions) {
      if (action.query) {
        actionTypes.push(action.type);
        const typeMap: Record<string, string> = {
          search: 'web',
          image: 'images',
          video: 'videos',
          music: 'music',
        };
        const results = (await this.search.search(
          typeMap[action.type] ?? 'web',
          action.query,
        )) as SearchResult[];
        searchResults.push(...results);
      }
    }

    let clientActions = [
      ...buildClientActions({ searchResults, actionTypes, userMessage: input.message }),
      ...clientActionsFromJarvisActions(actions),
    ];

    clientActions = this.deduplicateClientActions(clientActions);

    let finalReply = reply;

    if (searchResults.length) {
      const synthesized = await this.ai.synthesizeWithResults(
        input.message,
        searchResults,
        actionTypes,
      );
      finalReply = synthesized || synthesizeFallbackReply(input.message, searchResults, actionTypes);
    } else if (!finalReply.trim()) {
      finalReply = synthesizeFallbackReply(input.message, searchResults, actionTypes)
        || 'Senhor, não consegui formular uma resposta no momento.';
    }

    if (clientActions.length) {
      finalReply += buildConfirmationPrompt(clientActions);
    }

    const pendingClientActions = clientActions.filter((a) => a.requiresConfirmation);

    this.store.addMessage(sessionId, {
      id: uuidv4(),
      role: 'assistant',
      content: finalReply,
      timestamp: new Date(),
      metadata: {
        actions,
        searchResults: searchResults.length,
        pendingClientActions,
      },
    });

    return {
      reply: finalReply,
      sessionId,
      actions,
      searchResults: searchResults.length ? searchResults : undefined,
      clientActions: clientActions.length ? clientActions : undefined,
    };
  }

  private handleConfirmation(
    sessionId: string,
    message: string,
    confirmation: 'yes' | 'no',
    pending: ClientAction[],
  ): SendMessageOutput {
    this.store.addMessage(sessionId, {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    if (confirmation === 'no') {
      const reply = buildDeclinedReply();
      this.store.addMessage(sessionId, {
        id: uuidv4(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        metadata: { pendingClientActions: [] },
      });
      return { reply, sessionId, actions: [], clientActions: [] };
    }

    const selected = this.resolveSelectedAction(message, pending);
    const toExecute = selected ? [selected] : pending.map((a) => ({ ...a, requiresConfirmation: false }));

    const reply = selected
      ? buildConfirmedReply(selected)
      : `${buildConfirmedReply(toExecute[0])} Executando ${toExecute.length} ação(ões).`;

    this.store.addMessage(sessionId, {
      id: uuidv4(),
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
      metadata: { pendingClientActions: [], executedClientActions: toExecute },
    });

    return {
      reply,
      sessionId,
      actions: [],
      clientActions: toExecute.map((a) => ({ ...a, requiresConfirmation: false })),
    };
  }

  /** Seleciona ação específica quando o usuário diz "abre no spotify", etc. */
  private resolveSelectedAction(message: string, pending: ClientAction[]): ClientAction | null {
    const lower = message.toLowerCase();
    if (/spotify/.test(lower)) return pending.find((a) => a.app === 'spotify') ?? null;
    if (/youtube|yt/.test(lower)) return pending.find((a) => a.app === 'youtube' && a.type !== 'play_embed') ?? null;
    if (/aqui|interface|embed|reproduz/.test(lower)) return pending.find((a) => a.type === 'play_embed') ?? null;
    if (/navegador|browser|link/.test(lower)) return pending.find((a) => a.app === 'browser') ?? null;
    if (/gmail|email/.test(lower)) return pending.find((a) => a.app === 'gmail') ?? null;
    return pending.length === 1 ? pending[0] : null;
  }

  private deduplicateClientActions(actions: ClientAction[]): ClientAction[] {
    const seen = new Set<string>();
    return actions.filter((a) => {
      const key = `${a.type}:${a.url}:${a.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
