import { describe, expect, it } from 'vitest';
import { buildTranscriptFromResults, VOICE_SILENCE_END_DELAY_MS } from './useVoice';

describe('useVoice helpers', () => {
  it('usa delay de 3 segundos para encerrar após silêncio', () => {
    expect(VOICE_SILENCE_END_DELAY_MS).toBe(3000);
  });

  it('buildTranscriptFromResults concatena todos os segmentos', () => {
    const event = {
      resultIndex: 0,
      results: {
        length: 2,
        0: { isFinal: true, length: 1, 0: { transcript: 'Olá ' } },
        1: { isFinal: false, length: 1, 0: { transcript: 'JARVIS' } },
      },
    };

    expect(buildTranscriptFromResults(event)).toBe('Olá JARVIS');
  });

  it('buildTranscriptFromResults retorna string vazia sem segmentos', () => {
    const event = {
      resultIndex: 0,
      results: { length: 0 },
    };

    expect(buildTranscriptFromResults(event)).toBe('');
  });
});
