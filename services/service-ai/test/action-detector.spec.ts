import { describe, it, expect } from 'vitest';
import { extractSearchQuery, detectActionsFromText } from '../src/infrastructure/adapters/action-detector';

describe('extractSearchQuery', () => {
  it('should extract song name from YouTube music command', () => {
    expect(extractSearchQuery('busca no YouTube a música Espírito Santo')).toBe('Espírito Santo');
  });

  it('should extract from play command', () => {
    expect(extractSearchQuery('coloque a música Espírito Santo')).toBe('Espírito Santo');
  });

  it('should keep plain queries', () => {
    expect(extractSearchQuery('notícias de IA')).toBe('notícias de IA');
  });
});

describe('detectActionsFromText', () => {
  it('should detect video action for YouTube music request', () => {
    const actions = detectActionsFromText('busca no YouTube a música Espírito Santo');
    expect(actions).toEqual([{ type: 'video', query: 'Espírito Santo' }]);
  });

  it('should detect video action for music play request', () => {
    const actions = detectActionsFromText('toque a música Espírito Santo');
    expect(actions).toEqual([{ type: 'video', query: 'Espírito Santo' }]);
  });

  it('should detect search action for web queries', () => {
    const actions = detectActionsFromText('busque notícias de IA');
    expect(actions.some((a) => a.type === 'search')).toBe(true);
  });
});
