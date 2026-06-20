import { describe, it, expect } from 'vitest';
import { needsExtendedPrompt, shouldAttachTools } from '../src/domain/services/prompt-strategy';

describe('prompt-strategy', () => {
  it('should attach tools for search commands', () => {
    expect(shouldAttachTools('busque no google notícias de IA')).toBe(true);
  });

  it('should skip tools for simple creator question', () => {
    expect(shouldAttachTools('Qual o nome do seu criador?')).toBe(false);
    expect(needsExtendedPrompt('Qual o nome do seu criador?')).toBe(false);
  });

  it('should use extended prompt for architecture questions', () => {
    expect(needsExtendedPrompt('faça um code review desta arquitetura')).toBe(true);
    expect(shouldAttachTools('faça um code review desta arquitetura')).toBe(true);
  });
});
