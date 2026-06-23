import { describe, expect, it } from 'vitest';
import {
  buildLiveTranscriptPreview,
  buildTranscriptFromResults,
  extractTranscriptSegmentsFromEvent,
  VOICE_SILENCE_END_DELAY_MS,
} from './useVoice';

describe('useVoice helpers', () => {
  it('usa delay de 3 segundos para encerrar após silêncio', () => {
    expect(VOICE_SILENCE_END_DELAY_MS).toBe(3000);
  });

  it('buildTranscriptFromResults normaliza pontuação e acentos', () => {
    const event = {
      resultIndex: 0,
      results: {
        length: 2,
        0: { isFinal: true, length: 1, 0: { transcript: 'Olá ' } },
        1: { isFinal: true, length: 1, 0: { transcript: 'JARVIS' } },
      },
    };

    expect(buildTranscriptFromResults(event)).toBe('Olá, JARVIS.');
  });

  it('extractTranscriptSegmentsFromEvent extrai segmentos brutos', () => {
    const event = {
      resultIndex: 0,
      results: {
        length: 2,
        0: { isFinal: true, length: 1, 0: { transcript: 'Olá ' } },
        1: { isFinal: false, length: 1, 0: { transcript: 'JARVIS' } },
      },
    };

    expect(extractTranscriptSegmentsFromEvent(event)).toEqual([
      { text: 'Olá', isFinal: true },
      { text: 'JARVIS', isFinal: false },
    ]);
  });

  it('buildLiveTranscriptPreview atualiza texto ao vivo normalizado', () => {
    const event = {
      resultIndex: 0,
      results: {
        length: 1,
        0: { isFinal: true, length: 1, 0: { transcript: 'voce pode me ajudar' } },
      },
    };

    expect(buildLiveTranscriptPreview(event)).toContain('Você');
  });

  it('buildTranscriptFromResults retorna string vazia sem segmentos', () => {
    const event = {
      resultIndex: 0,
      results: { length: 0 },
    };

    expect(buildTranscriptFromResults(event)).toBe('');
  });
});
