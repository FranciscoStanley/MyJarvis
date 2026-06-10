import { create } from 'zustand';
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
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  initSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { ...msg, id: crypto.randomUUID(), timestamp: new Date() }],
    })),

  initSession: async () => {
    try {
      const { sessionId } = await api.createSession();
      set({ sessionId });
    } catch {
      set({ sessionId: crypto.randomUUID() });
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
        content: 'Desculpe, senhor. Encontrei dificuldades ao processar sua solicitação. Verifique se os serviços estão em execução.',
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
    set({ isAuthenticated: true, userName: result.user.name });
    await get().initSession();
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('jarvis_token');
    set({ isAuthenticated: false, userName: null, messages: [], sessionId: null });
  },
}));
