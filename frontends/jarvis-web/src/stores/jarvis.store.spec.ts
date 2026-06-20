import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJarvisStore } from '@/stores/jarvis.store';

vi.mock('@/lib/api', () => ({
  api: {
    createSession: vi.fn().mockResolvedValue({ sessionId: 'test-session' }),
    sendMessage: vi.fn(),
    getToken: vi.fn().mockReturnValue('token'),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('Jarvis Store — clientActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useJarvisStore.setState({
      messages: [],
      sessionId: 'test-session',
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
});
