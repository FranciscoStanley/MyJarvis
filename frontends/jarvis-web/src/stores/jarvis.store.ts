import { create } from 'zustand';
import { UserRole, hasRole, ClientAction } from '@myjarvis/shared';
import { api } from '@/lib/api';
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
  pendingClientActions: ClientAction[];
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userName: string | null;
  userRoles: UserRole[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  confirmAction: (textOrAction: string | ClientAction) => Promise<void>;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  initSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginLdap: (username: string, password: string) => Promise<void>;
  restoreSession: () => Promise<boolean>;
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

async function ensureChatSession(
  sessionId: string | null,
  set: (partial: Partial<JarvisState>) => void,
): Promise<string> {
  if (sessionId) return sessionId;
  const { sessionId: newId } = await api.createSession();
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

export const useJarvisStore = create<JarvisState>((set, get) => ({
  messages: [],
  sessionId: null,
  pendingClientActions: [],
  isListening: false,
  isSpeaking: false,
  isLoading: false,
  isAuthenticated: false,
  userName: null,
  userRoles: [],

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { ...msg, id: crypto.randomUUID(), timestamp: new Date() }],
    })),

  initSession: async () => {
    try {
      const { sessionId } = await api.createSession();
      set({ sessionId });
    } catch (error) {
      console.error('[JARVIS] Falha ao criar sessão de chat:', error);
      set({ sessionId: null });
    }
  },

  sendMessage: async (text) => {
    const { addMessage } = get();
    addMessage({ role: 'user', content: text });
    set({ isLoading: true });

    try {
      const sessionId = await ensureChatSession(get().sessionId, set);
      const result = await api.sendMessage(text, sessionId);
      set({ sessionId: result.sessionId });

      const pending = (result.clientActions ?? []).filter((a) => a.requiresConfirmation);
      set({ pendingClientActions: pending });

      applyExecutedActions(addMessage, result.reply, result.clientActions);

      if (!pending.length) {
        set({ pendingClientActions: [] });
      }
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
    const { sessionId, addMessage, pendingClientActions, isLoading } = get();
    if (isLoading) return;

    if (typeof textOrAction !== 'string') {
      const action = textOrAction;
      const label = action.label.toLowerCase();
      const message = `sim, ${label}`;
      set({ isLoading: true });
      try {
        const result = await api.sendMessage(message, sessionId ?? undefined);
        set({ sessionId: result.sessionId, pendingClientActions: [] });
        applyExecutedActions(addMessage, result.reply, result.clientActions);
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
      set({ sessionId: result.sessionId, pendingClientActions: [] });
      applyExecutedActions(addMessage, result.reply, result.clientActions);
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
    set({
      isAuthenticated: true,
      userName: result.user.name,
      userRoles: result.user.roles,
    });
    await get().initSession();
  },

  loginLdap: async (username, password) => {
    const result = await api.loginLdap(username, password);
    api.setToken(result.accessToken);
    set({
      isAuthenticated: true,
      userName: result.user.name,
      userRoles: result.user.roles,
    });
    await get().initSession();
  },

  restoreSession: async () => {
    if (!api.getToken()) return false;
    try {
      const profile = await api.getProfile();
      set({
        isAuthenticated: true,
        userName: profile.name,
        userRoles: profile.roles,
      });
      await get().initSession();
      return true;
    } catch {
      api.clearToken();
      set({ isAuthenticated: false, userName: null, userRoles: [] });
      return false;
    }
  },

  hasRole: (role) => hasRole(get().userRoles, role),

  logout: () => {
    api.clearToken();
    set({
      isAuthenticated: false,
      userName: null,
      userRoles: [],
      messages: [],
      sessionId: null,
      pendingClientActions: [],
    });
  },
}));
