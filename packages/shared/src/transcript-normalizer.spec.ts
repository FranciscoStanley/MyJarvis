import { describe, expect, it } from 'vitest';
import {
  extractTranscriptSegments,
  joinTranscriptSegments,
  normalizePortugueseTranscript,
} from './transcript-normalizer';

describe('transcript-normalizer', () => {
  it('normaliza exemplo real do STT com acentos, vírgulas e interrogação', () => {
    const raw =
      'Boa noite ja deixa eu te perguntar Andou conversando com alguma ya recentemente algum outro modelo de a por exemplo';

    const result = normalizePortugueseTranscript(raw);

    expect(result).toContain('Boa noite,');
    expect(result).toContain('já');
    expect(result).toContain('perguntar:');
    expect(result).toMatch(/IA|AI/i);
    expect(result).toMatch(/\?$/);
  });

  it('insere vírgulas entre segmentos finais consecutivos', () => {
    const segments = [
      { text: 'Boa noite', isFinal: true },
      { text: 'tudo bem', isFinal: true },
    ];

    expect(joinTranscriptSegments(segments)).toBe('Boa noite, tudo bem');
  });

  it('restaura acentos comuns', () => {
    expect(normalizePortugueseTranscript('voce nao precisa fazer isso agora')).toBe(
      'Você não precisa fazer isso agora.',
    );
  });

  it('adiciona exclamação em interjeições', () => {
    expect(normalizePortugueseTranscript('nossa que incrivel')).toMatch(/!$/);
    expect(normalizePortugueseTranscript('nossa que incrivel')).toContain('incrível');
  });

  it('corrige nomes técnicos', () => {
    expect(normalizePortugueseTranscript('abre o youtube')).toContain('YouTube');
    expect(normalizePortugueseTranscript('usa ollama local')).toContain('Ollama');
  });

  it('extractTranscriptSegments ignora segmentos vazios', () => {
    const results = {
      length: 2,
      0: { isFinal: true, length: 1, 0: { transcript: 'Olá ' } },
      1: { isFinal: false, length: 1, 0: { transcript: 'JARVIS' } },
    };

    expect(extractTranscriptSegments(results)).toEqual([
      { text: 'Olá', isFinal: true },
      { text: 'JARVIS', isFinal: false },
    ]);
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(normalizePortugueseTranscript('')).toBe('');
    expect(normalizePortugueseTranscript('   ')).toBe('');
  });
});
