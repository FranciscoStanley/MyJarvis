import { Injectable, Inject, NotFoundException, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ClientAction,
  detectConfirmationIntent,
  getPendingClientActions,
  JarvisAction,
  normalizePortugueseTranscript,
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
import { buildDocSearchQuery } from '../../domain/services/doc-search';
import {
  buildConfirmationPrompt,
  buildConfirmedReply,
  buildDeclinedReply,
  synthesizeFallbackReply,
} from '../../domain/services/response-synthesizer';
import { buildActionAcknowledgement, isExplicitExecuteCommand } from '../../domain/services/action-intent';
import { PEER_AI, PeerAiPort } from '../../domain/ports/peer-ai.port';
import {
  PersistLearningUseCase,
  formatPeerInsight,
  mergeSearchWithPeer,
} from './learning.use-cases';
import { shouldPreserveContextualReply } from '../../domain/services/conversation-context';

export interface SendMessageInput {
  message: string;
  sessionId?: string;
  userId: string;
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
    @Optional() @Inject(PEER_AI) private readonly peerAi?: PeerAiPort,
    @Optional() private readonly persistLearning?: PersistLearningUseCase,
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    const sessionId = await this.resolveSessionId(input.sessionId, input.userId);
    const history = await this.store.getMessages(sessionId, input.userId);
    const userMessage = normalizePortugueseTranscript(input.message);

    const confirmation = detectConfirmationIntent(userMessage);
    const pending = getPendingClientActions(history);

    if (pending.length && confirmation !== 'none') {
      return this.handleConfirmation(sessionId, input.userId, userMessage, confirmation, pending);
    }

    await this.store.addMessage(sessionId, input.userId, {
      id: randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    const { reply, actions } = await this.ai.generateResponse(history, userMessage);

    const searchResults: SearchResult[] = [];
    const actionTypes: string[] = [];
    let peerInsight = '';
    let peerIdUsed = 'mistral';

    for (const action of actions) {
      if (action.type === 'peer_ai') {
        actionTypes.push('peer_ai');
        if (!this.peerAi) continue;
        peerIdUsed = String(action.data?.peerId ?? 'mistral');
        const result = await this.peerAi.consult({
          peerId: peerIdUsed,
          question: action.query ?? userMessage,
          context: action.data?.context ? String(action.data.context) : undefined,
        });
        if (result.available) {
          peerInsight = formatPeerInsight(peerIdUsed, result.answer);
        }
        continue;
      }

      const needsSearch = action.query || action.type === 'docs';
      if (needsSearch) {
        actionTypes.push(action.type);
        const typeMap: Record<string, string> = {
          search: 'web',
          docs: 'web',
          image: 'images',
          video: 'videos',
          music: 'music',
        };

        let query = action.query ?? '';
        if (action.type === 'docs') {
          query = buildDocSearchQuery({
            technology: String(action.data?.technology ?? ''),
            topic: String(action.query ?? action.data?.topic ?? userMessage),
          });
        }

        const results = (await this.search.search(
          typeMap[action.type] ?? 'web',
          query,
        )) as SearchResult[];
        searchResults.push(...results);
      }
    }

    let clientActions = [
      ...buildClientActions({ searchResults, actionTypes, userMessage }),
      ...clientActionsFromJarvisActions(actions, userMessage),
    ];

    clientActions = this.deduplicateClientActions(clientActions);

    if (isExplicitExecuteCommand(userMessage)) {
      clientActions = clientActions.map((a) => ({ ...a, requiresConfirmation: false }));
    }

    let finalReply = reply;

    const enrichedResults = mergeSearchWithPeer(searchResults, peerInsight, peerIdUsed);
    const preserveContext = shouldPreserveContextualReply(
      userMessage,
      history,
      reply,
      actionTypes,
    );

    if (enrichedResults.length && !preserveContext) {
      const synthesized = await this.ai.synthesizeWithResults(
        userMessage,
        enrichedResults,
        actionTypes,
        history,
      );
      finalReply = synthesized || synthesizeFallbackReply(userMessage, enrichedResults, actionTypes);
    } else if (preserveContext && peerInsight) {
      finalReply = `${reply.trim()}\n\n---\n**Complemento (${peerIdUsed}):** ${peerInsight.replace(/^Insight .+?:\s*/i, '')}`;
    } else if (!finalReply.trim() || /^desculpe,?\s+n[aã]o consegui/i.test(finalReply.trim())) {
      finalReply = buildActionAcknowledgement(actions, userMessage)
        || synthesizeFallbackReply(userMessage, searchResults, actionTypes)
        || 'Senhor, não consegui formular uma resposta no momento.';
    }

    const pendingOnly = clientActions.filter((a) => a.requiresConfirmation);
    if (pendingOnly.length) {
      finalReply += buildConfirmationPrompt(pendingOnly);
    }

    const pendingClientActions = pendingOnly;

    void this.persistLearning?.execute({
      userMessage,
      synthesizedReply: finalReply,
      searchResults: enrichedResults.length ? enrichedResults : undefined,
      actionTypes,
      peerInsight: peerInsight || undefined,
    });

    await this.store.addMessage(sessionId, input.userId, {
      id: randomUUID(),
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
      searchResults: enrichedResults.length ? enrichedResults : undefined,
      clientActions: clientActions.length ? clientActions : undefined,
    };
  }

  private async resolveSessionId(sessionId: string | undefined, userId: string): Promise<string> {
    if (sessionId && await this.store.sessionExists(sessionId, userId)) {
      return sessionId;
    }
    return this.store.createSession(userId);
  }

  private async handleConfirmation(
    sessionId: string,
    userId: string,
    message: string,
    confirmation: 'yes' | 'no',
    pending: ClientAction[],
  ): Promise<SendMessageOutput> {
    await this.store.addMessage(sessionId, userId, {
      id: randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    if (confirmation === 'no') {
      const reply = buildDeclinedReply();
      await this.store.addMessage(sessionId, userId, {
        id: randomUUID(),
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

    await this.store.addMessage(sessionId, userId, {
      id: randomUUID(),
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
      const key = `${a.type}:${a.app ?? ''}:${a.url}`;
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

  async execute(sessionId: string, userId: string) {
    if (!await this.store.sessionExists(sessionId, userId)) {
      throw new NotFoundException('Conversa não encontrada');
    }
    return this.store.getMessages(sessionId, userId);
  }
}

@Injectable()
export class ListSessionsUseCase {
  constructor(
    @Inject(CONVERSATION_STORE) private readonly store: ConversationStorePort,
  ) {}

  execute(userId: string) {
    return this.store.listSessions(userId);
  }
}

@Injectable()
export class DeleteSessionUseCase {
  constructor(
    @Inject(CONVERSATION_STORE) private readonly store: ConversationStorePort,
  ) {}

  async execute(sessionId: string, userId: string) {
    const deleted = await this.store.deleteSession(sessionId, userId);
    if (!deleted) {
      throw new NotFoundException('Conversa não encontrada');
    }
    return { deleted: true };
  }
}

@Injectable()
export class CreateSessionUseCase {
  constructor(
    @Inject(CONVERSATION_STORE) private readonly store: ConversationStorePort,
  ) {}

  async execute(userId: string) {
    return { sessionId: await this.store.createSession(userId) };
  }
}
