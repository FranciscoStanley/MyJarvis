import { describe, it, expect } from 'vitest';
import { needsExtendedPrompt, shouldAttachTools, buildOllamaChatOptions } from '../src/domain/services/prompt-strategy';

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

  it('should use extended prompt for dev follow-ups from history', () => {
    const history = [
      { id: '1', role: 'user' as const, content: 'Crie um projeto NestJS fullstack', timestamp: new Date() },
      { id: '2', role: 'assistant' as const, content: 'Certamente, senhor.', timestamp: new Date() },
    ];
    expect(needsExtendedPrompt('continue com o próximo arquivo', history)).toBe(true);
  });

  it('should allocate more tokens for dev conversations', () => {
    const opts = buildOllamaChatOptions('crie um projeto nestjs', []);
    expect(opts.num_predict).toBeGreaterThanOrEqual(4096);
    expect(opts.num_ctx).toBeGreaterThanOrEqual(8192);
  });
});
