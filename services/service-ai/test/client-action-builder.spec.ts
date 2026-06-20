import { describe, it, expect } from 'vitest';
import { buildClientActions } from '../src/domain/services/client-action-builder';
import { SearchResult } from '@myjarvis/shared';

describe('buildClientActions', () => {
  const youtubeResult: SearchResult = {
    title: 'Espírito Santo',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    snippet: 'Música gospel',
    type: 'video',
  };

  it('should offer play, youtube and spotify for video search', () => {
    const actions = buildClientActions({
      searchResults: [youtubeResult],
      actionTypes: ['video'],
      userMessage: 'toque Espírito Santo no youtube',
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
});
