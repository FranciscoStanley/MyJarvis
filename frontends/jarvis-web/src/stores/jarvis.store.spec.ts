import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJarvisStore } from '@/stores/jarvis.store';

vi.mock('@/lib/api', () => ({
  api: {
    createSession: vi.fn().mockResolvedValue({ sessionId: 'test-session' }),
    sendMessage: vi.fn(),
    listSessions: vi.fn().mockResolvedValue([]),
    getSessionHistory: vi.fn().mockResolvedValue({ sessionId: 'test-session', messages: [] }),
    deleteSession: vi.fn().mockResolvedValue({ deleted: true }),
    getToken: vi.fn().mockReturnValue('token'),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  },
  readStoredSessionId: vi.fn().mockReturnValue(null),
  writeStoredSessionId: vi.fn(),
}));

import { api } from '@/lib/api';

describe('Jarvis Store — clientActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useJarvisStore.setState({
      messages: [],
      sessionId: 'test-session',
      userId: 'user-1',
      sessions: {
        'test-session': { messages: [], pendingClientActions: [], isLoading: false },
      },
      conversations: [],
      pendingClientActions: [],
      isLoading: false,
    });
  });

  it('should auto-execute clientActions with requiresConfirmation=false', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    vi.mocked(api.sendMessage).mockResolvedValue({
      reply: 'À sua disposição, senhor. Abrindo YouTube.',
      sessionId: 'test-session',
      clientActions: [{
        id: 'yt-1',
        type: 'open_app',
        label: 'Abrir YouTube',
        description: 'Abrir YouTube',
        url: 'https://www.youtube.com',
        app: 'youtube',
        requiresConfirmation: false,
      }],
    });

    await useJarvisStore.getState().sendMessage('Abra o YouTube');

    expect(openSpy).toHaveBeenCalledWith('https://www.youtube.com', '_blank', 'noopener,noreferrer');
    expect(useJarvisStore.getState().pendingClientActions).toEqual([]);

    const assistantMsg = useJarvisStore.getState().messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.content).toContain('YouTube');

    openSpy.mockRestore();
  });

  it('should keep pending actions when confirmation is required', async () => {
    vi.mocked(api.sendMessage).mockResolvedValue({
      reply: 'Encontrei o vídeo.\n\nDeseja que eu abrir no youtube?',
      sessionId: 'test-session',
      clientActions: [{
        id: 'yt-2',
        type: 'open_url',
        label: 'Abrir no YouTube',
        description: 'Abrir vídeo',
        url: 'https://www.youtube.com/watch?v=abc',
        app: 'youtube',
        requiresConfirmation: true,
      }],
    });

    await useJarvisStore.getState().sendMessage('busque vídeo jarvis');

    expect(useJarvisStore.getState().pendingClientActions).toHaveLength(1);
    expect(useJarvisStore.getState().pendingClientActions[0].requiresConfirmation).toBe(true);
  });

  it('should show friendly message on timeout errors', async () => {
    vi.mocked(api.sendMessage).mockRejectedValue(
      new Error('timeout of 120000ms exceeded'),
    );

    await useJarvisStore.getState().sendMessage('olá');

    const assistantMsg = useJarvisStore.getState().messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.content).toContain('Ollama demorou mais que o esperado');
    expect(assistantMsg?.content).not.toContain('120000ms');
  });

  it('should execute confirmed action via confirmAction', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    useJarvisStore.setState({
      pendingClientActions: [{
        id: 'p1',
        type: 'open_url',
        label: 'Abrir no YouTube',
        description: 'Abrir',
        url: 'https://www.youtube.com/watch?v=xyz',
        app: 'youtube',
        requiresConfirmation: true,
      }],
    });

    vi.mocked(api.sendMessage).mockResolvedValue({
      reply: 'Muito bem, senhor. Abrindo no navegador.',
      sessionId: 'test-session',
      clientActions: [{
        id: 'p1',
        type: 'open_url',
        label: 'Abrir no YouTube',
        description: 'Abrir',
        url: 'https://www.youtube.com/watch?v=xyz',
        app: 'youtube',
        requiresConfirmation: false,
      }],
    });

    await useJarvisStore.getState().confirmAction('sim');

    expect(openSpy).toHaveBeenCalled();
    expect(useJarvisStore.getState().pendingClientActions).toEqual([]);

    openSpy.mockRestore();
  });

  it('should keep processing in background when switching conversations', async () => {
    let resolveSend: (value: Awaited<ReturnType<typeof api.sendMessage>>) => void;
    const sendPromise = new Promise<Awaited<ReturnType<typeof api.sendMessage>>>((resolve) => {
      resolveSend = resolve;
    });

    vi.mocked(api.sendMessage).mockReturnValue(sendPromise);
    vi.mocked(api.getSessionHistory).mockResolvedValue({
      sessionId: 'other-session',
      messages: [],
    });

    useJarvisStore.setState({
      sessionId: 'test-session',
      sessions: {
        'test-session': { messages: [], pendingClientActions: [], isLoading: false },
        'other-session': { messages: [], pendingClientActions: [], isLoading: false },
      },
    });

    const sendTask = useJarvisStore.getState().sendMessage('mensagem longa');

    expect(useJarvisStore.getState().isSessionLoading('test-session')).toBe(true);

    await useJarvisStore.getState().selectConversation('other-session');
    expect(useJarvisStore.getState().sessionId).toBe('other-session');
    expect(useJarvisStore.getState().isSessionLoading('test-session')).toBe(true);

    resolveSend!({
      reply: 'Resposta concluída em background.',
      sessionId: 'test-session',
    });

    await sendTask;

    expect(useJarvisStore.getState().sessions['test-session']?.messages).toHaveLength(2);
    expect(useJarvisStore.getState().sessions['test-session']?.isLoading).toBe(false);
    expect(useJarvisStore.getState().messages).toEqual([]);
  });
});
