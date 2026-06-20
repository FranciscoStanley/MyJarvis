import { describe, it, expect } from 'vitest';
import { buildClientActions, clientActionsFromJarvisActions } from '../src/domain/services/client-action-builder';
import { SearchResult } from '@myjarvis/shared';

describe('buildClientActions', () => {
  const youtubeResult: SearchResult = {
    title: 'Espírito Santo',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    snippet: 'Música gospel',
    type: 'video',
  };

  it('should offer play, youtube and spotify for video search when not explicit', () => {
    const actions = buildClientActions({
      searchResults: [youtubeResult],
      actionTypes: ['video'],
      userMessage: 'qual vídeo do Espírito Santo no youtube',
    });

    expect(actions.length).toBeGreaterThanOrEqual(3);
    expect(actions.some((a) => a.type === 'play_embed')).toBe(true);
    expect(actions.some((a) => a.app === 'spotify')).toBe(true);
    expect(actions.every((a) => a.requiresConfirmation)).toBe(true);
  });

  it('should offer browser open for web results', () => {
    const actions = buildClientActions({
      searchResults: [{ title: 'Notícia IA', url: 'https://example.com', snippet: '', type: 'web' }],
      actionTypes: ['search'],
      userMessage: 'busque notícias de IA',
    });

    expect(actions.some((a) => a.app === 'browser')).toBe(true);
  });

  it('should offer new browser tab for tab commands', () => {
    const actions = buildClientActions({
      searchResults: [],
      actionTypes: [],
      userMessage: 'abrir uma nova aba do navegador',
    });

    expect(actions.some((a) => a.url === 'about:blank' && a.app === 'browser')).toBe(true);
  });

  it('should auto-execute explicit open commands without confirmation', () => {
    const actions = buildClientActions({
      searchResults: [],
      actionTypes: [],
      userMessage: 'Abra o YouTube',
    });

    expect(actions.some((a) => a.app === 'youtube' && !a.requiresConfirmation)).toBe(true);
  });

  it('should map JarvisAction open_app with auto-confirm when explicit', () => {
    const actions = clientActionsFromJarvisActions(
      [{
        type: 'open_app',
        data: {
          url: 'https://www.youtube.com',
          app: 'youtube',
          label: 'Abrir YouTube',
          description: 'Abrir YouTube',
        },
      }],
      'Abra o YouTube',
    );
    expect(actions[0].requiresConfirmation).toBe(false);
  });
});
