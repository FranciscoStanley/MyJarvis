import { create } from 'zustand';
import { UserRole, hasRole } from '@myjarvis/shared';
import { api } from '@/lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  searchResults?: unknown[];
}

interface JarvisState {
  messages: Message[];
  sessionId: string | null;
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userName: string | null;
  userRoles: UserRole[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  initSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginLdap: (username: string, password: string) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  hasRole: (role: UserRole) => boolean;
  logout: () => void;
}

export const useJarvisStore = create<JarvisState>((set, get) => ({
  messages: [],
  sessionId: null,
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
    } catch {
      set({ sessionId: null });
    }
  },

  sendMessage: async (text) => {
    const { sessionId, addMessage } = get();
    addMessage({ role: 'user', content: text });
    set({ isLoading: true });

    try {
      const result = await api.sendMessage(text, sessionId ?? undefined);
      set({ sessionId: result.sessionId });
      addMessage({
        role: 'assistant',
        content: result.reply,
        searchResults: result.searchResults,
      });
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Desculpe, senhor. Encontrei dificuldades ao processar sua solicitação. Verifique se está autenticado e se os serviços estão em execução.',
      });
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
    });
  },
}));
