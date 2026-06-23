import { create } from 'zustand';
import { UserRole, hasRole, ClientAction, ChatMessage } from '@myjarvis/shared';
import {
  api,
  ConversationSummary,
  readStoredSessionId,
  writeStoredSessionId,
} from '@/lib/api';
import { executeClientActions } from '@/lib/client-actions';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  searchResults?: unknown[];
  clientActions?: ClientAction[];
  embedUrl?: string | null;
}

interface JarvisState {
  messages: Message[];
  sessionId: string | null;
  userId: string | null;
  conversations: ConversationSummary[];
  isLoadingConversations: boolean;
  pendingClientActions: ClientAction[];
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsTermsAcceptance: boolean;
  userName: string | null;
  userRoles: UserRole[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  confirmAction: (textOrAction: string | ClientAction) => Promise<void>;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  loadConversations: () => Promise<void>;
  selectConversation: (sessionId: string) => Promise<void>;
  createNewChat: () => Promise<void>;
  deleteConversation: (sessionId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginLdap: (username: string, password: string) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  acceptTerms: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  logout: () => void;
}

function formatUserError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Erro desconhecido';
  if (/401|unauthorized|não autorizado/i.test(raw)) {
    return 'Sua sessão expirou, senhor. Saia e entre novamente.';
  }
  if (/timeout|timed out|abort/i.test(raw)) {
    return 'Senhor, o Ollama demorou mais que o esperado. Aguarde o modelo carregar na primeira mensagem ou tente um pedido mais curto.';
  }
  return `Desculpe, senhor. ${raw}`;
}

function mapApiMessage(msg: ChatMessage): Message {
  const metadata = msg.metadata ?? {};
  const pendingClientActions = Array.isArray(metadata.pendingClientActions)
    ? (metadata.pendingClientActions as ClientAction[])
    : undefined;

  return {
    id: msg.id,
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    clientActions: pendingClientActions,
  };
}

function restorePendingFromMessages(messages: Message[]): ClientAction[] {
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  return (lastAssistant?.clientActions ?? []).filter((a) => a.requiresConfirmation);
}

async function ensureChatSession(
  sessionId: string | null,
  userId: string | null,
  set: (partial: Partial<JarvisState>) => void,
): Promise<string> {
  if (sessionId) return sessionId;
  const { sessionId: newId } = await api.createSession();
  if (userId) writeStoredSessionId(userId, newId);
  set({ sessionId: newId });
  return newId;
}

function applyExecutedActions(
  addMessage: JarvisState['addMessage'],
  reply: string,
  clientActions?: ClientAction[],
) {
  if (!clientActions?.length) {
    addMessage({ role: 'assistant', content: reply, clientActions });
    return;
  }

  const toExecute = clientActions.filter((a) => !a.requiresConfirmation);
  const { embedUrl } = executeClientActions(toExecute);

  addMessage({
    role: 'assistant',
    content: reply,
    clientActions: clientActions.filter((a) => a.requiresConfirmation),
    embedUrl,
    searchResults: embedUrl
      ? [{ title: 'Reprodução', url: embedUrl, snippet: '', type: 'video' }]
      : undefined,
  });
}

function applyAuthUser(
  user: { id: string; name: string; roles: UserRole[]; hasAcceptedTerms?: boolean },
  set: (partial: Partial<JarvisState>) => void,
) {
  set({
    isAuthenticated: true,
    userId: user.id,
    userName: user.name,
    userRoles: user.roles,
    needsTermsAcceptance: !user.hasAcceptedTerms,
  });
}

async function bootstrapChatState(
  userId: string,
  set: (partial: Partial<JarvisState>) => void,
  get: () => JarvisState,
) {
  set({ isLoadingConversations: true });
  try {
    const conversations = await api.listSessions();
    set({ conversations });

    const storedId = readStoredSessionId(userId);
    const targetId =
      storedId && conversations.some((c) => c.id === storedId)
        ? storedId
        : conversations[0]?.id;

    if (targetId) {
      await get().selectConversation(targetId);
      return;
    }

    const { sessionId } = await api.createSession();
    writeStoredSessionId(userId, sessionId);
    set({
      sessionId,
      messages: [],
      pendingClientActions: [],
      conversations: [{
        id: sessionId,
        userId,
        title: 'Nova conversa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      }],
    });
  } catch (error) {
    console.error('[JARVIS] Falha ao restaurar conversas:', error);
    set({ sessionId: null, messages: [], conversations: [] });
  } finally {
    set({ isLoadingConversations: false });
  }
}

export const useJarvisStore = create<JarvisState>((set, get) => ({
  messages: [],
  sessionId: null,
  userId: null,
  conversations: [],
  isLoadingConversations: false,
  pendingClientActions: [],
  isListening: false,
  isSpeaking: false,
  isLoading: false,
  isAuthenticated: false,
  needsTermsAcceptance: false,
  userName: null,
  userRoles: [],

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { ...msg, id: crypto.randomUUID(), timestamp: new Date() }],
    })),

  loadConversations: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ isLoadingConversations: true });
    try {
      const conversations = await api.listSessions();
      set({ conversations });
    } catch (error) {
      console.error('[JARVIS] Falha ao listar conversas:', error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (sessionId) => {
    const { userId } = get();
    if (!userId) return;

    set({ isLoading: true, sessionId, pendingClientActions: [] });
    try {
      const { messages: raw } = await api.getSessionHistory(sessionId);
      const messages = raw
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map(mapApiMessage);

      writeStoredSessionId(userId, sessionId);
      set({
        messages,
        sessionId,
        pendingClientActions: restorePendingFromMessages(messages),
      });
    } catch (error) {
      console.error('[JARVIS] Falha ao carregar conversa:', error);
      set({ messages: [], pendingClientActions: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createNewChat: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { sessionId } = await api.createSession();
      writeStoredSessionId(userId, sessionId);
      const now = new Date().toISOString();
      set((s) => ({
        sessionId,
        messages: [],
        pendingClientActions: [],
        conversations: [
          {
            id: sessionId,
            userId,
            title: 'Nova conversa',
            createdAt: now,
            updatedAt: now,
            messageCount: 0,
          },
          ...s.conversations,
        ],
      }));
    } catch (error) {
      console.error('[JARVIS] Falha ao criar conversa:', error);
    }
  },

  deleteConversation: async (sessionId) => {
    const { userId, sessionId: activeId } = get();
    if (!userId) return;

    try {
      await api.deleteSession(sessionId);
      const remaining = get().conversations.filter((c) => c.id !== sessionId);
      set({ conversations: remaining });

      if (activeId === sessionId) {
        if (remaining[0]) {
          await get().selectConversation(remaining[0].id);
        } else {
          writeStoredSessionId(userId, null);
          await get().createNewChat();
        }
      }
    } catch (error) {
      console.error('[JARVIS] Falha ao excluir conversa:', error);
    }
  },

  sendMessage: async (text) => {
    const { addMessage, userId } = get();
    addMessage({ role: 'user', content: text });
    set({ isLoading: true });

    try {
      const sessionId = await ensureChatSession(get().sessionId, userId, set);
      const result = await api.sendMessage(text, sessionId);
      if (userId) writeStoredSessionId(userId, result.sessionId);
      set({ sessionId: result.sessionId });

      const pending = (result.clientActions ?? []).filter((a) => a.requiresConfirmation);
      set({ pendingClientActions: pending });

      applyExecutedActions(addMessage, result.reply, result.clientActions);

      if (!pending.length) {
        set({ pendingClientActions: [] });
      }

      void get().loadConversations();
    } catch (error) {
      console.error('[JARVIS] Falha ao enviar mensagem:', error);
      addMessage({
        role: 'assistant',
        content: formatUserError(error),
      });
      set({ pendingClientActions: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmAction: async (textOrAction) => {
    const { sessionId, addMessage, pendingClientActions, isLoading, userId } = get();
    if (isLoading) return;

    if (typeof textOrAction !== 'string') {
      const action = textOrAction;
      const label = action.label.toLowerCase();
      const message = `sim, ${label}`;
      set({ isLoading: true });
      try {
        const result = await api.sendMessage(message, sessionId ?? undefined);
        if (userId) writeStoredSessionId(userId, result.sessionId);
        set({ sessionId: result.sessionId, pendingClientActions: [] });
        applyExecutedActions(addMessage, result.reply, result.clientActions);
        void get().loadConversations();
      } catch {
        addMessage({
          role: 'assistant',
          content: 'Senhor, não consegui executar a ação. Tente novamente.',
        });
      } finally {
        set({ isLoading: false });
      }
      return;
    }

    if (!pendingClientActions.length) {
      await get().sendMessage(textOrAction);
      return;
    }

    addMessage({ role: 'user', content: textOrAction });
    set({ isLoading: true });

    try {
      const result = await api.sendMessage(textOrAction, sessionId ?? undefined);
      if (userId) writeStoredSessionId(userId, result.sessionId);
      set({ sessionId: result.sessionId, pendingClientActions: [] });
      applyExecutedActions(addMessage, result.reply, result.clientActions);
      void get().loadConversations();
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Senhor, não consegui executar a ação. Tente novamente.',
      });
      set({ pendingClientActions: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  setListening: (v) => set({ isListening: v }),
  setSpeaking: (v) => set({ isSpeaking: v }),

  login: async (email, password) => {
    const result = await api.login(email, password);
    api.setToken(result.accessToken);
    applyAuthUser(result.user, set);
    if (result.user.hasAcceptedTerms) {
      await bootstrapChatState(result.user.id, set, get);
    }
  },

  loginLdap: async (username, password) => {
    const result = await api.loginLdap(username, password);
    api.setToken(result.accessToken);
    applyAuthUser(result.user, set);
    if (result.user.hasAcceptedTerms) {
      await bootstrapChatState(result.user.id, set, get);
    }
  },

  restoreSession: async () => {
    if (!api.getToken()) return false;
    try {
      const profile = await api.getProfile();
      applyAuthUser(profile, set);
      if (profile.hasAcceptedTerms) {
        await bootstrapChatState(profile.id, set, get);
      }
      return true;
    } catch {
      api.clearToken();
      set({
        isAuthenticated: false,
        needsTermsAcceptance: false,
        userName: null,
        userRoles: [],
        userId: null,
        conversations: [],
      });
      return false;
    }
  },

  acceptTerms: async () => {
    const profile = await api.acceptTerms();
    applyAuthUser(profile, set);
    await bootstrapChatState(profile.id, set, get);
  },

  hasRole: (role) => hasRole(get().userRoles, role),

  logout: () => {
    api.clearToken();
    set({
      isAuthenticated: false,
      needsTermsAcceptance: false,
      userName: null,
      userRoles: [],
      userId: null,
      messages: [],
      sessionId: null,
      conversations: [],
      pendingClientActions: [],
    });
  },
}));
