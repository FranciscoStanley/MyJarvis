import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stripTextForSpeech, executeClientAction, executeClientActions } from '@/lib/client-actions';
import type { ClientAction } from '@myjarvis/shared';

describe('stripTextForSpeech', () => {
  it('should remove URLs and confirmation prompts', () => {
    const text = 'Senhor, encontrei a música.\n\nDeseja que eu abrir no youtube? https://youtube.com/x';
    const result = stripTextForSpeech(text);
    expect(result).not.toContain('https://');
    expect(result).not.toContain('Deseja que eu');
  });

  it('should remove "Posso ... senhor?" confirmation blocks', () => {
    const text = 'Localizei o vídeo.\n\nPosso abrir no youtube, abrir no spotify. O que prefere, senhor?';
    expect(stripTextForSpeech(text)).not.toMatch(/Posso/i);
  });
});

describe('executeClientAction', () => {
  it('should open url in new window', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const action: ClientAction = {
      id: '1',
      type: 'open_url',
      label: 'Abrir',
      description: 'Abrir link',
      url: 'https://example.com',
      requiresConfirmation: false,
    };
    expect(executeClientAction(action)).toBe(true);
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('should open YouTube url for open_app', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const action: ClientAction = {
      id: '2',
      type: 'open_app',
      label: 'Abrir YouTube',
      description: 'Abrir YouTube',
      url: 'https://www.youtube.com',
      app: 'youtube',
      requiresConfirmation: false,
    };
    expect(executeClientAction(action)).toBe(true);
    expect(openSpy).toHaveBeenCalledWith('https://www.youtube.com', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('should open about:blank for new browser tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const action: ClientAction = {
      id: '3',
      type: 'open_url',
      label: 'Nova aba',
      description: 'Abrir nova aba',
      url: 'about:blank',
      app: 'browser',
      requiresConfirmation: false,
    };
    executeClientAction(action);
    expect(openSpy).toHaveBeenCalledWith('about:blank', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});

describe('executeClientActions', () => {
  it('should skip actions that require confirmation', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const actions: ClientAction[] = [
      {
        id: 'a',
        type: 'open_url',
        label: 'Pendente',
        description: 'Aguarda sim',
        url: 'https://pending.com',
        requiresConfirmation: true,
      },
      {
        id: 'b',
        type: 'open_app',
        label: 'YouTube',
        description: 'Abrir YouTube',
        url: 'https://www.youtube.com',
        app: 'youtube',
        requiresConfirmation: false,
      },
    ];
    const { executed, embedUrl } = executeClientActions(actions);
    expect(executed).toHaveLength(1);
    expect(executed[0].app).toBe('youtube');
    expect(embedUrl).toBeNull();
    expect(openSpy).toHaveBeenCalledTimes(1);
    openSpy.mockRestore();
  });

  it('should return embedUrl for play_embed actions', () => {
    const actions: ClientAction[] = [{
      id: 'c',
      type: 'play_embed',
      label: 'Reproduzir',
      description: 'Reproduzir na interface',
      url: 'https://www.youtube.com/watch?v=abc',
      app: 'youtube',
      requiresConfirmation: false,
    }];
    const { executed, embedUrl } = executeClientActions(actions);
    expect(embedUrl).toBe('https://www.youtube.com/watch?v=abc');
    expect(executed).toHaveLength(1);
  });
});
