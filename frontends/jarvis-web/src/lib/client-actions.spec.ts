import { describe, it, expect, vi } from 'vitest';
import { stripTextForSpeech, executeClientAction } from '@/lib/client-actions';
import type { ClientAction } from '@myjarvis/shared';

describe('stripTextForSpeech', () => {
  it('should remove URLs and confirmation prompts', () => {
    const text = 'Senhor, encontrei a música.\n\nDeseja que eu abrir no youtube? https://youtube.com/x';
    const result = stripTextForSpeech(text);
    expect(result).not.toContain('https://');
    expect(result).not.toContain('Deseja que eu');
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
});
