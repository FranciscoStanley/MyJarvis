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

interface SessionState {
  messages: Message[];
  pendingClientActions: ClientAction[];
  isLoading: boolean;
}

interface JarvisState {
  messages: Message[];
  sessionId: string | null;
  userId: string | null;
  sessions: Record<string, SessionState>;
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
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>, sessionId?: string) => void;
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
  isSessionLoading: (sessionId: string) => boolean;
}

const EMPTY_SESSION: SessionState = {
  messages: [],
  pendingClientActions: [],
  isLoading: false,
};

function getSessionState(sessions: Record<string, SessionState>, sessionId: string): SessionState {
  return sessions[sessionId] ?? EMPTY_SESSION;
}

function syncActiveView(
  sessionId: string | null,
  sessions: Record<string, SessionState>,
): Pick<JarvisState, 'messages' | 'isLoading' | 'pendingClientActions'> {
  if (!sessionId) {
    return { messages: [], isLoading: false, pendingClientActions: [] };
  }
  const active = getSessionState(sessions, sessionId);
  return {
    messages: active.messages,
    isLoading: active.isLoading,
    pendingClientActions: active.pendingClientActions,
  };
}

function patchSession(
  sessions: Record<string, SessionState>,
  sessionId: string,
  patch: Partial<SessionState>,
): Record<string, SessionState> {
  return {
    ...sessions,
    [sessionId]: { ...getSessionState(sessions, sessionId), ...patch },
  };
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
  set: (partial: Partial<JarvisState> | ((s: JarvisState) => Partial<JarvisState>)) => void,
  get: () => JarvisState,
): Promise<string> {
  if (sessionId) return sessionId;
  const { sessionId: newId } = await api.createSession();
  if (userId) writeStoredSessionId(userId, newId);
  set((s) => {
    const sessions = patchSession(s.sessions, newId, EMPTY_SESSION);
    return { sessionId: newId, sessions, ...syncActiveView(newId, sessions) };
  });
  return newId;
}

function buildAssistantMessage(
  reply: string,
  clientActions?: ClientAction[],
): Omit<Message, 'id' | 'timestamp'> {
  if (!clientActions?.length) {
    return { role: 'assistant', content: reply, clientActions };
  }

  const toExecute = clientActions.filter((a) => !a.requiresConfirmation);
  const { embedUrl } = executeClientActions(toExecute);

  return {
    role: 'assistant',
    content: reply,
    clientActions: clientActions.filter((a) => a.requiresConfirmation),
    embedUrl,
    searchResults: embedUrl
      ? [{ title: 'Reprodução', url: embedUrl, snippet: '', type: 'video' }]
      : undefined,
  };
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
  set: (partial: Partial<JarvisState> | ((s: JarvisState) => Partial<JarvisState>)) => void,
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
    const now = new Date().toISOString();
    set((s) => {
      const sessions = patchSession(s.sessions, sessionId, EMPTY_SESSION);
      return {
        sessionId,
        sessions,
        conversations: [{
          id: sessionId,
          userId,
          title: 'Nova conversa',
          createdAt: now,
          updatedAt: now,
          messageCount: 0,
        }],
        ...syncActiveView(sessionId, sessions),
      };
    });
  } catch (error) {
    console.error('[JARVIS] Falha ao restaurar conversas:', error);
    set({ sessionId: null, messages: [], conversations: [], sessions: {} });
  } finally {
    set({ isLoadingConversations: false });
  }
}

export const useJarvisStore = create<JarvisState>((set, get) => ({
  messages: [],
  sessionId: null,
  userId: null,
  sessions: {},
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

  isSessionLoading: (sessionId) => get().sessions[sessionId]?.isLoading ?? false,

  addMessage: (msg, targetSessionId) =>
    set((s) => {
      const sid = targetSessionId ?? s.sessionId;
      if (!sid) return s;

      const current = getSessionState(s.sessions, sid);
      const newMessage: Message = { ...msg, id: crypto.randomUUID(), timestamp: new Date() };
      const sessions = patchSession(s.sessions, sid, {
        messages: [...current.messages, newMessage],
      });

      if (sid === s.sessionId) {
        return { sessions, messages: sessions[sid].messages };
      }
      return { sessions };
    }),

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
    const { userId, sessions } = get();
    if (!userId) return;

    writeStoredSessionId(userId, sessionId);

    const cached = sessions[sessionId];
    if (cached) {
      set({
        sessionId,
        ...syncActiveView(sessionId, sessions),
      });
      if (cached.isLoading) return;
    } else {
      set({
        sessionId,
        messages: [],
        isLoading: true,
        pendingClientActions: [],
      });
    }

    try {
      const { messages: raw } = await api.getSessionHistory(sessionId);
      const messages = raw
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map(mapApiMessage);

      set((s) => {
        const existing = getSessionState(s.sessions, sessionId);
        if (existing.isLoading) {
          return { sessionId, ...syncActiveView(sessionId, s.sessions) };
        }

        const sessions = patchSession(s.sessions, sessionId, {
          messages,
          pendingClientActions: restorePendingFromMessages(messages),
          isLoading: false,
        });

        return {
          sessionId,
          sessions,
          ...syncActiveView(sessionId, sessions),
        };
      });
    } catch (error) {
      console.error('[JARVIS] Falha ao carregar conversa:', error);
      set((s) => {
        if (s.sessions[sessionId]?.isLoading) {
          return { sessionId, ...syncActiveView(sessionId, s.sessions) };
        }
        const sessions = patchSession(s.sessions, sessionId, {
          messages: [],
          pendingClientActions: [],
          isLoading: false,
        });
        return { sessionId, sessions, ...syncActiveView(sessionId, sessions) };
      });
    }
  },

  createNewChat: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { sessionId } = await api.createSession();
      writeStoredSessionId(userId, sessionId);
      const now = new Date().toISOString();
      set((s) => {
        const sessions = patchSession(s.sessions, sessionId, EMPTY_SESSION);
        return {
          sessionId,
          sessions,
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
          ...syncActiveView(sessionId, sessions),
        };
      });
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
      set((s) => {
        const { [sessionId]: _, ...restSessions } = s.sessions;
        return { conversations: remaining, sessions: restSessions };
      });

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
    const { userId, sessionId: currentSessionId } = get();

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    if (currentSessionId) {
      set((s) => {
        const current = getSessionState(s.sessions, currentSessionId);
        const sessions = patchSession(s.sessions, currentSessionId, {
          messages: [...current.messages, userMsg],
          isLoading: true,
        });
        const view = s.sessionId === currentSessionId
          ? { messages: sessions[currentSessionId].messages, isLoading: true }
          : {};
        return { sessions, ...view };
      });
    }

    const sessionId = await ensureChatSession(currentSessionId, userId, set, get);

    if (!currentSessionId) {
      set((s) => {
        const current = getSessionState(s.sessions, sessionId);
        const sessions = patchSession(s.sessions, sessionId, {
          messages: [...current.messages, userMsg],
          isLoading: true,
        });
        const view = s.sessionId === sessionId
          ? { messages: sessions[sessionId].messages, isLoading: true }
          : {};
        return { sessions, ...view };
      });
    }

    try {
      const result = await api.sendMessage(text, sessionId);
      if (userId) writeStoredSessionId(userId, result.sessionId);

      const pending = (result.clientActions ?? []).filter((a) => a.requiresConfirmation);
      const assistantMsg = buildAssistantMessage(result.reply, result.clientActions);
      const resolvedSessionId = result.sessionId;

      set((s) => {
        const current = getSessionState(s.sessions, resolvedSessionId);
        const sessions = patchSession(s.sessions, resolvedSessionId, {
          messages: [
            ...current.messages,
            { ...assistantMsg, id: crypto.randomUUID(), timestamp: new Date() },
          ],
          pendingClientActions: pending,
          isLoading: false,
        });

        const partial: Partial<JarvisState> = { sessions, sessionId: resolvedSessionId };
        if (s.sessionId === resolvedSessionId) {
          Object.assign(partial, syncActiveView(resolvedSessionId, sessions));
        }
        return partial;
      });

      void get().loadConversations();
    } catch (error) {
      console.error('[JARVIS] Falha ao enviar mensagem:', error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: formatUserError(error),
        timestamp: new Date(),
      };

      set((s) => {
        const current = getSessionState(s.sessions, sessionId);
        const sessions = patchSession(s.sessions, sessionId, {
          messages: [...current.messages, errorMsg],
          pendingClientActions: [],
          isLoading: false,
        });
        const partial: Partial<JarvisState> = { sessions };
        if (s.sessionId === sessionId) {
          Object.assign(partial, syncActiveView(sessionId, sessions));
        }
        return partial;
      });
    }
  },

  confirmAction: async (textOrAction) => {
    const { sessionId, pendingClientActions, isLoading, userId } = get();
    if (!sessionId || isLoading) return;

    const runConfirm = async (message: string) => {
      set((s) => {
        const sessions = patchSession(s.sessions, sessionId, { isLoading: true });
        return s.sessionId === sessionId
          ? { sessions, isLoading: true }
          : { sessions };
      });

      try {
        const result = await api.sendMessage(message, sessionId);
        if (userId) writeStoredSessionId(userId, result.sessionId);
        const assistantMsg = buildAssistantMessage(result.reply, result.clientActions);

        set((s) => {
          const current = getSessionState(s.sessions, sessionId);
          const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: message,
            timestamp: new Date(),
          };
          const sessions = patchSession(s.sessions, sessionId, {
            messages: [
              ...current.messages,
              userMsg,
              { ...assistantMsg, id: crypto.randomUUID(), timestamp: new Date() },
            ],
            pendingClientActions: [],
            isLoading: false,
          });
          const partial: Partial<JarvisState> = { sessions, sessionId: result.sessionId };
          if (s.sessionId === sessionId) {
            Object.assign(partial, syncActiveView(sessionId, sessions));
          }
          return partial;
        });
        void get().loadConversations();
      } catch {
        get().addMessage(
          { role: 'assistant', content: 'Senhor, não consegui executar a ação. Tente novamente.' },
          sessionId,
        );
        set((s) => {
          const sessions = patchSession(s.sessions, sessionId, { isLoading: false });
          return s.sessionId === sessionId
            ? { sessions, isLoading: false, pendingClientActions: [] }
            : { sessions };
        });
      }
    };

    if (typeof textOrAction !== 'string') {
      await runConfirm(`sim, ${textOrAction.label.toLowerCase()}`);
      return;
    }

    if (!pendingClientActions.length) {
      await get().sendMessage(textOrAction);
      return;
    }

    get().addMessage({ role: 'user', content: textOrAction }, sessionId);
    await runConfirm(textOrAction);
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
        sessions: {},
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
      sessions: {},
      pendingClientActions: [],
    });
  },
}));
