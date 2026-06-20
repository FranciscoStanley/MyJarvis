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

  it('should detect open browser tab command', () => {
    const actions = detectActionsFromText('abrir uma nova aba do navegador para mim');
    expect(actions).toEqual([{
      type: 'open_url',
      data: {
        url: 'about:blank',
        app: 'browser',
        label: 'Abrir nova aba',
        description: 'Abrir uma nova aba no navegador',
      },
    }]);
  });

  it('should detect YouTube music from open command with song name', () => {
    const actions = detectActionsFromText(
      'Abra o YouTube na música chamada Colossenses o nome da banda é rap hop music',
    );
    expect(actions).toEqual([{ type: 'video', query: expect.stringContaining('Colossenses') }]);
  });

  it('should detect enter YouTube command', () => {
    const actions = detectActionsFromText('Entre no YouTube');
    expect(actions.some((a) => a.type === 'open_app' && a.data?.app === 'youtube')).toBe(true);
  });

  it('should detect google search', () => {
    const actions = detectActionsFromText('busque no google inteligência artificial');
    expect(actions.some((a) => a.type === 'search')).toBe(true);
  });
});
